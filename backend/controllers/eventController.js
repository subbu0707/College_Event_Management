const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

// @desc    Get all events (upcoming and ongoing)
// @route   GET /api/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
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

    // Get registration count
    const registrationCount = await Registration.countDocuments({
      event: event._id,
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

    const events = await Event.find({ category })
      .populate("organizer", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments({ category });
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

    const events = await Event.find({
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
