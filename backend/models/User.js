const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // Don't return password by default
  },
  rollNumber: {
    type: String,
    required: [true, "Please provide a roll number"],
    unique: true,
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, "Please provide a valid phone number"],
  },
  role: {
    type: String,
    enum: ["student", "organizer", "admin"],
    default: "student",
    required: true,
  },
  branch: {
    type: String,
    enum: ["CSE", "ECE", "ME", "CE", "EE", "Other"],
    required: true,
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: true,
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"],
  },
  profileImage: {
    type: String,
    default: null,
  },
  registeredEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
