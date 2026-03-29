const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Register for an event
// @route   POST /api/registrations/register
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if event is approved
    if (event.approvalStatus !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Event is not approved yet" });
    }

    // Check if registration is open
    if (!event.registrationOpen || event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event",
      });
    }

    // Check if already registered (and registration is active)
    const existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (existingRegistration && existingRegistration.status === "registered") {
      return res
        .status(400)
        .json({ success: false, message: "Already registered for this event" });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Event is full, cannot register" });
    }

    let registration;

    // If there's a cancelled registration, reactivate it
    if (existingRegistration && existingRegistration.status === "cancelled") {
      existingRegistration.status = "registered";
      existingRegistration.registrationDate = Date.now();
      registration = await existingRegistration.save();
    } else {
      // Create new registration
      registration = new Registration({
        student: studentId,
        event: eventId,
        status: "registered",
      });
      await registration.save();
    }

    // Update event registered count
    event.registeredCount += 1;
    // Only add registration to array if not already present
    if (!event.registrations.includes(registration._id)) {
      event.registrations.push(registration._id);
    }
    await event.save();

    // Update user registered events and statistics
    const user = await User.findById(studentId);
    // Only add event to array if not already present
    if (!user.registeredEvents.includes(eventId)) {
      user.registeredEvents.push(eventId);
    }

    // Increment statistics
    if (!user.statistics) {
      user.statistics = {
        activeRegistrations: 0,
        completedEvents: 0,
        upcomingEvents: 0,
      };
    }
    user.statistics.activeRegistrations =
      (user.statistics.activeRegistrations || 0) + 1;

    // Check if event is upcoming
    const now = new Date();
    if (new Date(event.startDate) > now) {
      user.statistics.upcomingEvents =
        (user.statistics.upcomingEvents || 0) + 1;
    }

    await user.save();

    // Create notification
    const notification = new Notification({
      recipient: studentId,
      title: "Event Registration Confirmed",
      message: `You have successfully registered for ${event.title}`,
      type: "event_registration",
      event: eventId,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Successfully registered for the event",
      registration: await registration.populate(["student", "event"]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registered events
// @route   GET /api/registrations/my-registrations
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const studentId = req.user._id;

    const skip = (page - 1) * limit;

    const registrations = await Registration.find({ student: studentId })
      .populate("event")
      .populate("student")
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRegistrations = await Registration.countDocuments({
      student: studentId,
    });
    const totalPages = Math.ceil(totalRegistrations / limit);

    res.status(200).json({
      success: true,
      count: registrations.length,
      totalRegistrations,
      totalPages,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/registrations/cancel/:registrationId
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const studentId = req.user._id;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // Check if user is the one who registered
    if (registration.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this registration",
      });
    }

    // Update registration status
    registration.status = "cancelled";
    await registration.save();

    // Update event registered count
    const event = await Event.findById(registration.event);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    event.registrations = event.registrations.filter(
      (id) => id.toString() !== registrationId,
    );
    await event.save();

    // Update user registered events and statistics
    const user = await User.findById(studentId);
    user.registeredEvents = user.registeredEvents.filter(
      (id) => id.toString() !== registration.event.toString(),
    );

    // Decrement statistics
    if (!user.statistics) {
      user.statistics = {
        activeRegistrations: 0,
        completedEvents: 0,
        upcomingEvents: 0,
      };
    }
    user.statistics.activeRegistrations = Math.max(
      0,
      (user.statistics.activeRegistrations || 0) - 1,
    );

    // Check if event is/was upcoming
    const now = new Date();
    if (new Date(event.endDate) >= now) {
      user.statistics.upcomingEvents = Math.max(
        0,
        (user.statistics.upcomingEvents || 0) - 1,
      );
    }

    await user.save();

    // Create notification
    const notification = new Notification({
      recipient: studentId,
      title: "Registration Cancelled",
      message: `Your registration for ${event.title} has been cancelled`,
      type: "event_update",
      event: registration.event,
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user is registered for an event
// @route   GET /api/registrations/check/:eventId
exports.checkRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const registration = await Registration.findOne({
      student: studentId,
      event: eventId,
      status: "registered", // Only check for active registrations
    });

    res.status(200).json({
      success: true,
      isRegistered: !!registration,
      registration: registration || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard statistics
// @route   GET /api/registrations/student-stats
exports.getStudentStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    // Get user with statistics
    const user = await User.findById(studentId);

    // Get all registrations
    const registrations = await Registration.find({
      student: studentId,
    }).populate("event");

    // Calculate real-time statistics
    const activeRegistrations = registrations.filter(
      (reg) =>
        reg.status === "registered" &&
        reg.event &&
        new Date(reg.event.endDate) >= now,
    ).length;

    const upcomingEvents = registrations.filter(
      (reg) =>
        reg.status === "registered" &&
        reg.event &&
        new Date(reg.event.startDate) > now,
    ).length;

    const completedEvents = registrations.filter(
      (reg) =>
        reg.event &&
        (reg.status === "attended" ||
          (reg.status === "registered" && new Date(reg.event.endDate) < now)),
    ).length;

    // Update user statistics if they're out of sync
    if (!user.statistics) {
      user.statistics = {
        activeRegistrations: 0,
        completedEvents: 0,
        upcomingEvents: 0,
      };
    }

    user.statistics.activeRegistrations = activeRegistrations;
    user.statistics.upcomingEvents = upcomingEvents;
    user.statistics.completedEvents = completedEvents;
    await user.save();

    res.status(200).json({
      success: true,
      stats: {
        activeRegistrations,
        upcomingEvents,
        completedEvents,
        totalRegistrations: registrations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for an event
// @route   PUT /api/registrations/feedback/:registrationId
exports.submitFeedback = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { rating, feedback } = req.body;
    const studentId = req.user._id;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // Check if user is the one who registered
    if (registration.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit feedback for this registration",
      });
    }

    // Update feedback
    registration.participationHistory.rating = rating;
    registration.participationHistory.feedback = feedback;
    registration.participationHistory.feedbackGiven = true;
    await registration.save();

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      registration,
    });
  } catch (error) {
    next(error);
  }
};
