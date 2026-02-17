const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"],
  },
  type: {
    type: String,
    enum: [
      "event_registration",
      "event_update",
      "event_reminder",
      "event_cancelled",
      "event_approved",
      "event_rejected",
      "feedback_request",
      "system_message",
      "waitlist_notification",
    ],
    default: "event_update",
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 2592000 }, // Auto-delete after 30 days
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
