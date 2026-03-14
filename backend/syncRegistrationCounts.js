const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
require("dotenv").config();

const syncRegistrationCounts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/college_event_management",
    );
    console.log("MongoDB Connected...");

    // Get all events
    const events = await Event.find();
    console.log(`Found ${events.length} events to sync\n`);

    let updatedCount = 0;

    for (const event of events) {
      // Count actual active registrations
      const actualCount = await Registration.countDocuments({
        event: event._id,
        status: "registered",
      });

      // Check if count doesn't match
      if (event.registeredCount !== actualCount) {
        console.log(`Event: ${event.title}`);
        console.log(`  Old count: ${event.registeredCount}`);
        console.log(`  Actual count: ${actualCount}`);

        // Update the event with correct count
        event.registeredCount = actualCount;
        await event.save();
        updatedCount++;
        console.log(`  ✓ Updated to ${actualCount}\n`);
      }
    }

    console.log(`\nSync complete! Updated ${updatedCount} events.`);
    process.exit(0);
  } catch (error) {
    console.error("Error syncing counts:", error);
    process.exit(1);
  }
};

syncRegistrationCounts();
