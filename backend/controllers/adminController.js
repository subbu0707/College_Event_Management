const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const pendingApprovals = await Event.countDocuments({
      approvalStatus: "pending",
    });

    const activeEvents = await Event.countDocuments({
      status: { $in: ["upcoming", "ongoing"] },
      approvalStatus: "approved",
    });

    const completedEvents = await Event.countDocuments({
      status: "completed",
    });

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Events by category
    const eventsByCategory = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Events by status
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("organizer", "name email")
      .select("title status approvalStatus createdAt");

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalRegistrations,
          pendingApprovals,
          activeEvents,
          completedEvents,
        },
        usersByRole,
        eventsByCategory,
        eventsByStatus,
        recentUsers,
        recentEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["student", "organizer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user (Admin only)
// @route   PUT /api/admin/users/:id/deactivate
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend event (Admin only)
// @route   PUT /api/admin/events/:id/suspend
exports.suspendEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        cancellationReason: reason,
      },
      { new: true },
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Notify all registered users
    const registrations = await Registration.find({
      event: event._id,
      status: "approved",
    });

    const notifications = registrations.map((reg) => ({
      user: reg.user,
      title: "Event Suspended",
      message: `The event "${event.title}" has been suspended. Reason: ${reason}`,
      type: "alert",
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: "Event suspended successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event registrations (Admin only)
// @route   GET /api/admin/events/:id/registrations
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate("user", "name email rollNumber branch")
      .populate("event", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send system-wide announcement (Admin only)
// @route   POST /api/admin/announcement
exports.sendAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;

    const query = {};
    if (targetRole && targetRole !== "all") {
      query.role = targetRole;
    }

    const users = await User.find(query).select("_id");
    const userIds = users.map((u) => u._id);

    const notifications = userIds.map((userId) => ({
      user: userId,
      title,
      message,
      type: "announcement",
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${userIds.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics reports (Admin only)
// @route   GET /api/admin/reports
exports.getReports = async (req, res, next) => {
  try {
    // Registration trends by month
    const registrationTrends = await Registration.aggregate([
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
      { $limit: 12 },
    ]);

    // Events by department
    const eventsByDepartment = await Event.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "organizer",
          foreignField: "_id",
          as: "organizerInfo",
        },
      },
      { $unwind: "$organizerInfo" },
      {
        $group: {
          _id: "$organizerInfo.branch",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top events by registrations
    const topEvents = await Event.aggregate([
      { $sort: { registeredCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          title: 1,
          registeredCount: 1,
          capacity: 1,
          category: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        registrationTrends,
        eventsByDepartment,
        topEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs (Admin only)
// @route   GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Get recent events with approval history
    const events = await Event.find({
      $or: [{ approvalStatus: "approved" }, { approvalStatus: "rejected" }],
    })
      .populate("organizer", "name email")
      .populate("approvedBy", "name email")
      .select("title approvalStatus approvedBy updatedAt rejectionReason")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Event.countDocuments({
      $or: [{ approvalStatus: "approved" }, { approvalStatus: "rejected" }],
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
