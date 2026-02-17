const Event = require("../models/Event");

// @desc    Get organizer's events
// @route   GET /api/events/my-events
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("organizer", "name email");

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event (Admin only)
// @route   PUT /api/events/:id/approve
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    event.approvalStatus = "approved";
    event.approvedBy = req.user._id;
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event approved successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event (Admin only)
// @route   PUT /api/events/:id/reject
exports.rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    event.approvalStatus = "rejected";
    event.rejectionReason = reason;
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event rejected successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for admin
// @route   GET /api/events/admin/all
exports.getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
