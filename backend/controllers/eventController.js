const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper function to update event status based on dates
const updateEventStatus = (event) => {
  const now = new Date();
  let updated = false;

  if (event.endDate < now && event.status !== "completed") {
    event.status = "completed";
    event.registrationOpen = false;
    updated = true;
  } else if (
    event.startDate <= now &&
    event.endDate > now &&
    event.status !== "ongoing"
  ) {
    event.status = "ongoing";
    event.registrationOpen = false;
    updated = true;
  } else if (event.startDate > now && event.status !== "upcoming") {
    event.status = "upcoming";
    updated = true;
  }

  return updated;
};

// @desc    Get all events (upcoming and ongoing)
// @route   GET /api/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    // Build filter - only show approved events for public viewing
    const filter = { approvalStatus: "approved" };
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages,
      currentPage: parseInt(page),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event details
// @route   GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email phone branch")
      .populate("registrations");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Update status if needed
    const statusUpdated = updateEventStatus(event);
    if (statusUpdated) {
      await event.save();
    }

    // Get accurate registration count - only count active registrations
    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: "registered", // Only count active registrations, not cancelled ones
    });

    res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        registeredCount: registrationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
exports.getEventsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Only show approved events
    const events = await Event.find({ category, approvalStatus: "approved" })
      .populate("organizer", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments({
      category,
      approvalStatus: "approved",
    });
    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search events
// @route   GET /api/events/search/:keyword
exports.searchEvents = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Only show approved events
    const events = await Event.find({
      approvalStatus: "approved",
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    })
      .populate("organizer", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments({
      approvalStatus: "approved",
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    });

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      venue,
      capacity,
      tags,
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      category,
      startDate,
      endDate,
      venue,
      capacity,
      tags: tags || [],
      image: null,
      organizer: req.user._id,
      approvalStatus: "pending",
      status: "upcoming",
    });

    // Populate organizer details
    await event.populate("organizer", "name email phone branch");

    await Notification.create({
      recipient: req.user._id,
      title: "Event Created",
      message: `Your event "${event.title}" has been created and is pending admin approval.`,
      type: "event_update",
      event: event._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully and is pending admin approval",
      event,
    });
  } catch (error) {
    next(error);
  }
};
