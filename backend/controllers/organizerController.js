const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");

// @desc    Get organizer dashboard stats
// @route   GET /api/organizer/stats
exports.getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    const totalEvents = await Event.countDocuments({ organizer: organizerId });
    const pendingApproval = await Event.countDocuments({
      organizer: organizerId,
      approvalStatus: "pending",
    });
    const approvedEvents = await Event.countDocuments({
      organizer: organizerId,
      approvalStatus: "approved",
    });
    const activeEvents = await Event.countDocuments({
      organizer: organizerId,
      status: { $in: ["upcoming", "ongoing"] },
    });
    const completedEvents = await Event.countDocuments({
      organizer: organizerId,
      status: "completed",
    });

    // Get total registrations across all events
    const events = await Event.find({ organizer: organizerId }).select("_id");
    const eventIds = events.map((e) => e._id);

    const totalRegistrations = await Registration.countDocuments({
      event: { $in: eventIds },
      status: "approved",
    });

    // Events by status
    const eventsByStatus = await Event.aggregate([
      { $match: { organizer: organizerId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Registration trends
    const registrationTrends = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEvents,
          pendingApproval,
          approvedEvents,
          activeEvents,
          completedEvents,
          totalRegistrations,
        },
        eventsByStatus,
        registrationTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event participants
// @route   GET /api/organizer/events/:id/participants
exports.getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view participants",
      });
    }

    const participants = await Registration.find({
      event: req.params.id,
      status: "approved",
    })
      .populate("user", "name email rollNumber branch phone semester")
      .sort({ createdAt: 1 });

    const waitlist = await Registration.find({
      event: req.params.id,
      status: "waitlisted",
    })
      .populate("user", "name email rollNumber branch")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        participants,
        waitlist,
        count: {
          approved: participants.length,
          waitlisted: waitlist.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export participants list
// @route   GET /api/organizer/events/:id/export
exports.exportParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const participants = await Registration.find({
      event: req.params.id,
      status: "approved",
    })
      .populate("user", "name email rollNumber branch phone semester")
      .sort({ createdAt: 1 });

    // Format data for export
    const exportData = participants.map((p, index) => ({
      sNo: index + 1,
      name: p.user.name,
      rollNumber: p.user.rollNumber,
      email: p.user.email,
      branch: p.user.branch,
      semester: p.user.semester,
      phone: p.user.phone,
      registeredOn: p.createdAt.toLocaleDateString(),
    }));

    res.status(200).json({
      success: true,
      data: exportData,
      event: {
        title: event.title,
        date: event.startDate,
        venue: event.venue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification to event participants
// @route   POST /api/organizer/events/:id/notify
exports.notifyParticipants = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const registrations = await Registration.find({
      event: req.params.id,
      status: "approved",
    });

    const notifications = registrations.map((reg) => ({
      user: reg.user,
      title: `${event.title}: ${title}`,
      message,
      type: "event_update",
      relatedEvent: event._id,
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Notification sent to ${registrations.length} participants`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event status
// @route   PUT /api/organizer/events/:id/status
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    event.status = status;
    await event.save();

    // Notify participants of status change
    const registrations = await Registration.find({
      event: event._id,
      status: "approved",
    });

    const notifications = registrations.map((reg) => ({
      user: reg.user,
      title: `Event Status Updated: ${event.title}`,
      message: `The event status has been updated to "${status}".`,
      type: "event_update",
      relatedEvent: event._id,
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: "Event status updated successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close event registrations
// @route   PUT /api/organizer/events/:id/close-registration
exports.closeRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    event.registrationDeadline = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      message: "Registrations closed successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event analytics
// @route   GET /api/organizer/events/:id/analytics
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Registration stats by branch
    const registrationsByBranch = await Registration.aggregate([
      { $match: { event: event._id, status: "approved" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userInfo.branch",
          count: { $sum: 1 },
        },
      },
    ]);

    // Registration stats by semester
    const registrationsBySemester = await Registration.aggregate([
      { $match: { event: event._id, status: "approved" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userInfo.semester",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily registration trend
    const dailyRegistrations = await Registration.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        event: {
          title: event.title,
          capacity: event.capacity,
          registeredCount: event.registeredCount,
          occupancy: ((event.registeredCount / event.capacity) * 100).toFixed(
            1,
          ),
        },
        registrationsByBranch,
        registrationsBySemester,
        dailyRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/organizer/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if event has registrations
    const hasRegistrations = await Registration.countDocuments({
      event: event._id,
    });

    if (hasRegistrations > 0 && event.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete event with existing registrations. Please cancel the event instead.",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
