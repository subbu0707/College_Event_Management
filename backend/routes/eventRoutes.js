const express = require("express");
const {
  getAllEvents,
  getEventById,
  getEventsByCategory,
  searchEvents,
} = require("../controllers/eventController");
const {
  getMyEvents,
  approveEvent,
  rejectEvent,
  getAllEventsAdmin,
} = require("../controllers/adminEventController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/category/:category", getEventsByCategory);
router.get("/search/:keyword", searchEvents);
router.get("/:id", getEventById);

// Organizer routes
router.get(
  "/organizer/my-events",
  auth,
  authorize("organizer", "admin"),
  getMyEvents,
);

// Admin routes
router.get("/admin/all", auth, authorize("admin"), getAllEventsAdmin);
router.put("/:id/approve", auth, authorize("admin"), approveEvent);
router.put("/:id/reject", auth, authorize("admin"), rejectEvent);

module.exports = router;
