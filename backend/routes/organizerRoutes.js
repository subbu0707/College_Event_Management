const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const {
  getOrganizerStats,
  getEventParticipants,
  exportParticipants,
  notifyParticipants,
  updateEventStatus,
  closeRegistrations,
  getEventAnalytics,
  deleteEvent,
} = require("../controllers/organizerController");

// All routes are protected and require organizer role
router.use(auth);
router.use(authorize("organizer", "admin"));

router.get("/stats", getOrganizerStats);
router.get("/events/:id/participants", getEventParticipants);
router.get("/events/:id/export", exportParticipants);
router.post("/events/:id/notify", notifyParticipants);
router.put("/events/:id/status", updateEventStatus);
router.put("/events/:id/close-registration", closeRegistrations);
router.get("/events/:id/analytics", getEventAnalytics);
router.delete("/events/:id", deleteEvent);

module.exports = router;
