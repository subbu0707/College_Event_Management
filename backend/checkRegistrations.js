const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const User = require("./models/User");
require("dotenv").config();

const checkRegistrations = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/college_event_management",
    );
    console.log("MongoDB Connected...\n");

    // Find the event
    const event = await Event.findOne({ title: /robotics/i });

    if (!event) {
      console.log("Event not found");
      process.exit(0);
    }

    console.log(`Event: ${event.title}`);
    console.log(`Capacity: ${event.capacity}`);
    console.log(`Database Count: ${event.registeredCount}\n`);

    // Get all registrations for this event
    const registrations = await Registration.find({ event: event._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    console.log(
      `Total registrations (all statuses): ${registrations.length}\n`,
    );

    // Group by status
    const byStatus = {};
    registrations.forEach((reg) => {
      if (!byStatus[reg.status]) byStatus[reg.status] = [];
      byStatus[reg.status].push(reg);
    });

    // Display each status
    for (const [status, regs] of Object.entries(byStatus)) {
      console.log(`\n${status.toUpperCase()} (${regs.length}):`);
      regs.forEach((reg, i) => {
        const studentName = reg.student ? reg.student.name : "[Deleted User]";
        const studentEmail = reg.student ? reg.student.email : "[N/A]";
        console.log(`  ${i + 1}. ${studentName} (${studentEmail})`);
        console.log(
          `     Registered: ${new Date(reg.createdAt).toLocaleString()}`,
        );
        if (reg.cancelledAt) {
          console.log(
            `     Cancelled: ${new Date(reg.cancelledAt).toLocaleString()}`,
          );
        }
      });
    }

    console.log("\n" + "=".repeat(50));
    console.log(
      `✓ Active registrations: ${byStatus["registered"]?.length || 0}`,
    );
    console.log(`✗ Cancelled: ${byStatus["cancelled"]?.length || 0}`);
    console.log(`✓ Attended: ${byStatus["attended"]?.length || 0}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkRegistrations();
