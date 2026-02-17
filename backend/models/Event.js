const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide event title"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide event description"],
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  category: {
    type: String,
    enum: ["Technical", "Cultural", "Sports", "Academic", "Social", "Workshop"],
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please provide start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide end date"],
  },
  venue: {
    type: String,
    required: [true, "Please provide venue"],
    maxlength: [200, "Venue cannot exceed 200 characters"],
  },
  capacity: {
    type: Number,
    required: [true, "Please provide event capacity"],
    min: [1, "Capacity must be at least 1"],
  },
  registeredCount: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: null,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [String],
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  rejectionReason: {
    type: String,
    maxlength: [500, "Rejection reason cannot exceed 500 characters"],
  },
  waitlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  registrations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update status based on dates
eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.endDate < now) {
    this.status = "completed";
  } else if (this.startDate <= now && this.endDate > now) {
    this.status = "ongoing";
  } else if (this.startDate > now) {
    this.status = "upcoming";
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
