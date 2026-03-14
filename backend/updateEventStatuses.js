const mongoose = require("mongoose");
const Event = require("./models/Event");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for event status update"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function updateEventStatuses() {
  try {
    const now = new Date();
    let updated = 0;

    // Find events that need status update
    const events = await Event.find({
      $or: [
        // Events that should be ongoing
        {
          status: "upcoming",
          startDate: { $lte: now },
          endDate: { $gt: now },
        },
        // Events that should be completed
        {
          status: { $in: ["upcoming", "ongoing"] },
          endDate: { $lt: now },
        },
      ],
    });

    console.log(`Found ${events.length} events that need status update`);

    for (const event of events) {
      if (event.endDate < now) {
        event.status = "completed";
        event.registrationOpen = false;
        await event.save();
        updated++;
        console.log(
          `✓ Event "${event.title}" status updated to COMPLETED (ended at ${event.endDate})`,
        );
      } else if (event.startDate <= now && event.endDate > now) {
        event.status = "ongoing";
        event.registrationOpen = false;
        await event.save();
        updated++;
        console.log(
          `✓ Event "${event.title}" status updated to ONGOING and registrations CLOSED (started at ${event.startDate})`,
        );
      }
    }

    console.log(`\nSuccessfully updated ${updated} events`);

    // Close connection if running as standalone script
    if (require.main === module) {
      await mongoose.connection.close();
      console.log("Database connection closed");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error updating event statuses:", error);
    if (require.main === module) {
      process.exit(1);
    }
  }
}

// Export for use in server
module.exports = updateEventStatuses;

// Run if executed directly
if (require.main === module) {
  updateEventStatuses();
}
