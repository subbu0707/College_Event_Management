require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/college_event_management",
    );
    console.log("MongoDB Connected for seeding...");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

const sampleEvents = [
  {
    title: "Tech Fest 2026",
    description:
      "Annual technical festival featuring coding competitions, hackathons, tech talks, and workshops. Join us for 3 days of innovation and learning!",
    category: "Technical",
    startDate: new Date("2026-03-15T09:00:00"),
    endDate: new Date("2026-03-17T18:00:00"),
    venue: "Main Auditorium & Tech Labs",
    capacity: 200,
    tags: ["coding", "hackathon", "tech talks", "workshops"],
  },
  {
    title: "Cultural Night 2026",
    description:
      "Celebrate diversity with music, dance, drama performances, and traditional fashion shows. Experience the rich cultural heritage of our college!",
    category: "Cultural",
    startDate: new Date("2026-04-10T17:00:00"),
    endDate: new Date("2026-04-10T22:00:00"),
    venue: "Open Air Theater",
    capacity: 500,
    tags: ["music", "dance", "drama", "fashion show"],
  },
  {
    title: "Annual Sports Meet",
    description:
      "Inter-department sports competition including cricket, football, basketball, volleyball, and athletics. Let the games begin!",
    category: "Sports",
    startDate: new Date("2026-02-20T07:00:00"),
    endDate: new Date("2026-02-22T18:00:00"),
    venue: "Sports Complex",
    capacity: 300,
    tags: ["cricket", "football", "basketball", "athletics"],
  },
  {
    title: "AI & Machine Learning Workshop",
    description:
      "Hands-on workshop on AI and ML fundamentals, neural networks, and practical implementations using Python and TensorFlow.",
    category: "Workshop",
    startDate: new Date("2026-03-05T10:00:00"),
    endDate: new Date("2026-03-05T16:00:00"),
    venue: "Computer Lab 1",
    capacity: 50,
    tags: ["AI", "machine learning", "python", "tensorflow"],
  },
  {
    title: "Guest Lecture: Future of Technology",
    description:
      "Industry expert talk on emerging technologies, career opportunities, and the future of software development.",
    category: "Academic",
    startDate: new Date("2026-02-28T14:00:00"),
    endDate: new Date("2026-02-28T16:00:00"),
    venue: "Seminar Hall",
    capacity: 150,
    tags: ["guest lecture", "technology", "career"],
  },
  {
    title: "Blood Donation Camp",
    description:
      "Annual blood donation drive in collaboration with local hospitals. Save lives by donating blood!",
    category: "Social",
    startDate: new Date("2026-03-01T09:00:00"),
    endDate: new Date("2026-03-01T15:00:00"),
    venue: "College Medical Center",
    capacity: 100,
    tags: ["blood donation", "social service", "healthcare"],
  },
  {
    title: "Web Development Bootcamp",
    description:
      "Intensive 2-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build real-world projects!",
    category: "Workshop",
    startDate: new Date("2026-03-20T09:00:00"),
    endDate: new Date("2026-03-21T17:00:00"),
    venue: "Computer Lab 2",
    capacity: 40,
    tags: ["web development", "react", "nodejs", "bootcamp"],
  },
  {
    title: "Science Exhibition",
    description:
      "Display innovative projects and experiments from various science departments. Witness creativity and innovation!",
    category: "Academic",
    startDate: new Date("2026-04-15T10:00:00"),
    endDate: new Date("2026-04-16T17:00:00"),
    venue: "Exhibition Hall",
    capacity: 250,
    tags: ["science", "innovation", "exhibition", "projects"],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await Event.deleteMany({});
    await User.deleteMany({});

    console.log("Creating sample organizer user...");
    const organizer = await User.create({
      name: "Event Organizer",
      email: "organizer@college.edu",
      password: "password123",
      rollNumber: "ORG001",
      phone: "9876543210",
      branch: "CSE",
      semester: 8,
    });

    console.log("Creating sample events...");
    const events = await Promise.all(
      sampleEvents.map((event) =>
        Event.create({
          ...event,
          organizer: organizer._id,
          registeredCount: Math.floor(Math.random() * 20), // Random initial registrations
        }),
      ),
    );

    console.log("✅ Database seeded successfully!");
    console.log(`Created ${events.length} events`);
    console.log("\nSample Organizer Credentials:");
    console.log("Email: organizer@college.edu");
    console.log("Password: password123");
    console.log(
      "\nYou can now create a student account and start registering for events!",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
