const express = require("express");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Get notifications (protected)
router.get("/", auth, getNotifications);

// Mark notification as read (protected)
router.put("/:notificationId/read", auth, markAsRead);

// Mark all as read (protected)
router.put("/read-all", auth, markAllAsRead);

// Delete notification (protected)
router.delete("/:notificationId", auth, deleteNotification);

module.exports = router;
