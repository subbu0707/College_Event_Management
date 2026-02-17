const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Register for an event
// @route   POST /api/registrations/register
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });
    if (existingRegistration) {
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

    // Create registration
    const registration = new Registration({
      student: studentId,
      event: eventId,
      status: "registered",
    });

    await registration.save();

    // Update event registered count
    event.registeredCount += 1;
    event.registrations.push(registration._id);
    await event.save();

    // Update user registered events
    const user = await User.findById(studentId);
    user.registeredEvents.push(eventId);
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
    const studentId = req.user.id;

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
    const studentId = req.user.id;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // Check if user is the one who registered
    if (registration.student.toString() !== studentId) {
      return res
        .status(403)
        .json({
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

    // Update user registered events
    const user = await User.findById(studentId);
    user.registeredEvents = user.registeredEvents.filter(
      (id) => id.toString() !== registration.event.toString(),
    );
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
    const studentId = req.user.id;

    const registration = await Registration.findOne({
      student: studentId,
      event: eventId,
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

// @desc    Submit feedback for an event
// @route   PUT /api/registrations/feedback/:registrationId
exports.submitFeedback = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { rating, feedback } = req.body;
    const studentId = req.user.id;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // Check if user is the one who registered
    if (registration.student.toString() !== studentId) {
      return res
        .status(403)
        .json({
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
