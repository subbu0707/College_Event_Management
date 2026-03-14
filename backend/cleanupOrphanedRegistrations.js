const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const User = require("./models/User");
require("dotenv").config();

const cleanupOrphanedRegistrations = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/college_event_management",
    );
    console.log("MongoDB Connected...\n");

    // Find all registrations
    const registrations = await Registration.find().populate("student");
    console.log(`Total registrations: ${registrations.length}`);

    let deletedCount = 0;
    const eventsToUpdate = new Set();

    for (const reg of registrations) {
      // If student is null, the user was deleted
      if (!reg.student) {
        console.log(`\nFound orphaned registration:`);
        console.log(`  Registration ID: ${reg._id}`);
        console.log(`  Event ID: ${reg.event}`);
        console.log(`  Status: ${reg.status}`);

        // Store event ID to update count later
        eventsToUpdate.add(reg.event.toString());

        // Delete the orphaned registration
        await Registration.deleteOne({ _id: reg._id });
        deletedCount++;
        console.log(`  ✓ Deleted`);
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Deleted ${deletedCount} orphaned registrations`);

    // Update event counts
    if (eventsToUpdate.size > 0) {
      console.log(`\nUpdating ${eventsToUpdate.size} events...`);

      for (const eventId of eventsToUpdate) {
        const event = await Event.findById(eventId);
        if (event) {
          const actualCount = await Registration.countDocuments({
            event: eventId,
            status: "registered",
          });

          console.log(`\nEvent: ${event.title}`);
          console.log(`  Old count: ${event.registeredCount}`);
          console.log(`  New count: ${actualCount}`);

          event.registeredCount = actualCount;
          await event.save();
          console.log(`  ✓ Updated`);
        }
      }
    }

    console.log(`\n✓ Cleanup complete!`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

cleanupOrphanedRegistrations();
