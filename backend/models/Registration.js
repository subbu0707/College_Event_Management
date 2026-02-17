const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["registered", "attended", "cancelled"],
    default: "registered",
  },
  participationHistory: {
    attended: {
      type: Boolean,
      default: false,
    },
    feedbackGiven: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
  },
});

// Ensure unique registration per student per event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
