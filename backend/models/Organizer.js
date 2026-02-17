const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const organizerSchema = new mongoose.Schema({
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
    select: false,
  },
  rollNumber: {
    type: String,
    required: [true, "Please provide an employee ID"],
    unique: true,
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, "Please provide a valid phone number"],
  },
  branch: {
    type: String,
    enum: ["CSE", "ECE", "ME", "CE", "EE", "Other"],
    required: true,
  },
  role: {
    type: String,
    default: "organizer",
    immutable: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"],
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
organizerSchema.pre("save", async function (next) {
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
organizerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Organizer", organizerSchema);
