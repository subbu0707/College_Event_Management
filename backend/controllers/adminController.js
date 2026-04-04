const User = require("../models/User");
const Admin = require("../models/Admin");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    // Count users from all three models
    const studentCount = await User.countDocuments();
    const adminCount = await Admin.countDocuments();
    const organizerCount = await Organizer.countDocuments();
    const totalUsers = studentCount + adminCount + organizerCount;

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

    // Users by role - count from all three models
    const usersByRole = [
      { _id: "student", count: studentCount },
      { _id: "organizer", count: organizerCount },
      { _id: "admin", count: adminCount },
    ];

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

    // Recent activity - get from all models
    const recentStudents = await User.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("name email role createdAt");

    const recentOrganizers = await Organizer.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("name email role createdAt");

    const recentAdmins = await Admin.find()
      .sort({ createdAt: -1 })
      .limit(1)
      .select("name email role createdAt");

    // Combine and sort recent users
    const recentUsers = [...recentStudents, ...recentOrganizers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

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
    const skip = (page - 1) * limit;

    let users = [];
    let count = 0;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { rollNumber: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    if (role) {
      // Query specific role model
      let Model;
      if (role === "student") Model = User;
      else if (role === "organizer") Model = Organizer;
      else if (role === "admin") Model = Admin;

      if (Model) {
        users = await Model.find(searchQuery)
          .select("-password")
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip(skip);

        count = await Model.countDocuments(searchQuery);
      }
    } else {
      // Query all models and combine results
      const [students, organizers, admins] = await Promise.all([
        User.find(searchQuery).select("-password").sort({ createdAt: -1 }),
        Organizer.find(searchQuery).select("-password").sort({ createdAt: -1 }),
        Admin.find(searchQuery).select("-password").sort({ createdAt: -1 }),
      ]);

      // Combine and sort by creation date
      const allUsers = [...students, ...organizers, ...admins].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      count = allUsers.length;
      users = allUsers.slice(skip, skip + parseInt(limit));
    }

    res.status(200).json({
      success: true,
      count: users.length,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
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

    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.role === "admin" || existingUser.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Role cannot be updated for admin or inactive users",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

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
      status: "registered",
    });

    const notifications = registrations.map((reg) => ({
      recipient: reg.student,
      title: "Event Suspended",
      message: `The event "${event.title}" has been suspended. Reason: ${reason}`,
      type: "event_cancelled",
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

    let userIds = [];

    // Fetch users based on targetRole from all three models
    if (targetRole === "all" || !targetRole) {
      // Get all users from all three models
      const [students, organizers, admins] = await Promise.all([
        User.find().select("_id"),
        Organizer.find().select("_id"),
        Admin.find().select("_id"),
      ]);
      userIds = [
        ...students.map((u) => u._id),
        ...organizers.map((u) => u._id),
        ...admins.map((u) => u._id),
      ];
    } else if (targetRole === "student") {
      const students = await User.find().select("_id");
      userIds = students.map((u) => u._id);
    } else if (targetRole === "organizer") {
      const organizers = await Organizer.find().select("_id");
      userIds = organizers.map((u) => u._id);
    } else if (targetRole === "admin") {
      const admins = await Admin.find().select("_id");
      userIds = admins.map((u) => u._id);
    }

    // Create notifications for all users
    const notifications = userIds.map((userId) => ({
      recipient: userId,
      title,
      message,
      type: "announcement",
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${userIds.length} users`,
      data: {
        totalRecipients: userIds.length,
        targetRole: targetRole || "all",
      },
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
