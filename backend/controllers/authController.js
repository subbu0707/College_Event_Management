const User = require("../models/User");
const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");
const jwt = require("jsonwebtoken");
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
    const user = await Model.findOne({ email }).select("+password");
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
    const user = await Model.findById(req.user._id);

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
