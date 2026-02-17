const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");

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

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the correct model based on role from token
    const Model = getModelByRole(decoded.role);

    // Get user with role
    const user = await Model.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Check if user account is active (if isActive field exists)
    if (user.isActive !== undefined && !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact admin.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
