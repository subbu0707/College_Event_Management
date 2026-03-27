const User = require("../models/User");
const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

// Helper function to get the correct model based on role
const getModelByRole = (role) => {
  switch (role) {
    case "admin":
      return Admin;
    case "organizer":
      return Organizer;
    case "student":
    default:
      return User;
  }
};

// Generate JWT Token with role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const createMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const getAllRoleModels = () => [
  { role: "student", model: User },
  { role: "organizer", model: Organizer },
  { role: "admin", model: Admin },
];

const getFrontendBaseUrl = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, "");
  }

  const requestOrigin = req.get("origin");
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
  }

  const host = req.get("host");
  if (host) {
    return `${req.protocol}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
};

// @desc    Register user (student/organizer/admin)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, rollNumber, phone, branch, semester, role } =
      req.body;

    // Determine which model to use
    const Model = getModelByRole(role || "student");

    // Check if user already exists
    let existingUser = await Model.findOne({
      $or: [{ email }, { rollNumber }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `${role || "User"} already exists with this email or ID`,
      });
    }

    // Create new user object based on role
    let userData = {
      name,
      email,
      password,
      rollNumber,
      phone,
    };

    // Add role-specific fields
    if (role === "student") {
      userData.branch = branch;
      userData.semester = semester;
      userData.role = "student";
    } else if (role === "organizer") {
      userData.branch = branch;
      userData.role = "organizer";
    } else if (role === "admin") {
      userData.role = "admin";
    }

    // Create new user
    const user = new Model(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: `${user.role} registered successfully`,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (student/organizer/admin)
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Please select a role" });
    }

    // Get the correct model based on role
    const Model = getModelByRole(role);

    // Check for user
    const user = await Model.findOne({ email })
      .select("+password")
      .populate("registeredEvents", "title status");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. No ${role} account found with this email.`,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const Model = getModelByRole(req.user.role);
    const user = await Model.findById(req.user._id).populate(
      "registeredEvents",
      "title status",
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, profileImage } = req.body;

    const Model = getModelByRole(req.user.role);
    const user = await Model.findByIdAndUpdate(
      req.user._id,
      { name, phone, bio, profileImage, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const Model = getModelByRole(req.user.role);
    const user = await Model.findById(req.user._id).select("+password");

    // Check old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send password reset link
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, role } = req.body;
    const Model = getModelByRole(role);
    const user = await Model.findOne({ email });

    // Always return a generic success message to prevent account enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const frontendBase = getFrontendBaseUrl(req);
    const resetUrl = `${frontendBase}/reset-password/${resetToken}`;

    const transporter = createMailTransporter();

    if (!transporter) {
      return res.status(200).json({
        success: true,
        message:
          "Password reset link generated. SMTP is not configured, so the link is returned for local testing.",
        resetUrl,
      });
    }

    const fromAddress =
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      "no-reply@college-event-management.local";

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token } = req.params;
    const { newPassword } = req.body;

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    let user = null;
    let selectedModel = null;

    for (const { model } of getAllRoleModels()) {
      const foundUser = await model.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (foundUser) {
        user = foundUser;
        selectedModel = model;
        break;
      }
    }

    if (!user || !selectedModel) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Update password and clear reset token fields using save() to trigger pre-save hooks
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};
