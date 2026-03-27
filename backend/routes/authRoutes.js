const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Register route
router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    body("rollNumber", "Roll number is required").notEmpty(),
    body("phone", "Phone number must be 10 digits").matches(/^\d{10}$/),
    body("branch", "Branch is required").notEmpty(),
    body("semester", "Semester is required").isInt({ min: 1, max: 8 }),
  ],
  register,
);

// Login route
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  login,
);

// Forgot password route
router.post(
  "/forgot-password",
  [
    body("email", "Please include a valid email").isEmail(),
    body("role", "Role must be student, organizer, or admin").isIn([
      "student",
      "organizer",
      "admin",
    ]),
  ],
  forgotPassword,
);

// Reset password route
router.put(
  "/reset-password/:token",
  [
    body("newPassword", "New password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  resetPassword,
);

// Get current user (protected)
router.get("/me", auth, getMe);

// Update profile (protected)
router.put("/update", auth, updateProfile);

// Change password (protected)
router.put(
  "/change-password",
  auth,
  [
    body("oldPassword", "Old password is required").notEmpty(),
    body("newPassword", "New password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  changePassword,
);

module.exports = router;
