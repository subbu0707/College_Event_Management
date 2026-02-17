const express = require("express");
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  checkRegistration,
  submitFeedback,
} = require("../controllers/registrationController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Register for event (protected)
router.post("/register", auth, registerForEvent);

// Get my registrations (protected)
router.get("/my-registrations", auth, getMyRegistrations);

// Check if registered for event (protected)
router.get("/check/:eventId", auth, checkRegistration);

// Cancel registration (protected)
router.delete("/cancel/:registrationId", auth, cancelRegistration);

// Submit feedback (protected)
router.put("/feedback/:registrationId", auth, submitFeedback);

module.exports = router;
