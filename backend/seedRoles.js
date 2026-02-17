// Enhanced seed script with role-based users
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Event = require("./models/Event");
const dotenv = require("dotenv");

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared existing data");

    // Create Admin User
    const admin = await User.create({
      name: "System Admin",
      email: "admin@college.edu",
      password: "admin123",
      rollNumber: "ADMIN001",
      phone: "9876543210",
      role: "admin",
      branch: "CSE",
      semester: 8,
      bio: "System administrator with full access to manage events and users",
    });

    // Create Event Organizers
    const organizer1 = await User.create({
      name: "Tech Club President",
      email: "organizer1@college.edu",
      password: "organizer123",
      rollNumber: "ORG001",
      phone: "9876543211",
      role: "organizer",
      branch: "CSE",
      semester: 7,
      bio: "Leading the tech club and organizing technical events",
    });

    const organizer2 = await User.create({
      name: "Cultural Secretary",
      email: "organizer2@college.edu",
      password: "organizer123",
      rollNumber: "ORG002",
      phone: "9876543212",
      role: "organizer",
      branch: "ECE",
      semester: 6,
      bio: "Managing cultural events and festivals",
    });

    // Create Students
    const students = await User.insertMany([
      {
        name: "Alice Johnson",
        email: "alice@college.edu",
        password: "student123",
        rollNumber: "CSE2021001",
        phone: "9876543213",
        role: "student",
        branch: "CSE",
        semester: 5,
        bio: "Passionate about coding and tech events",
      },
      {
        name: "Bob Smith",
        email: "bob@college.edu",
        password: "student123",
        rollNumber: "ECE2021002",
        phone: "9876543214",
        role: "student",
        branch: "ECE",
        semester: 5,
        bio: "Electronics enthusiast",
      },
      {
        name: "Charlie Brown",
        email: "charlie@college.edu",
        password: "student123",
        rollNumber: "ME2021003",
        phone: "9876543215",
        role: "student",
        branch: "ME",
        semester: 4,
        bio: "Mechanical engineering student interested in robotics",
      },
      {
        name: "Diana Prince",
        email: "diana@college.edu",
        password: "student123",
        rollNumber: "CE2021004",
        phone: "9876543216",
        role: "student",
        branch: "CE",
        semester: 6,
        bio: "Civil engineering student and sports enthusiast",
      },
      {
        name: "Eve Wilson",
        email: "eve@college.edu",
        password: "student123",
        rollNumber: "EE2021005",
        phone: "9876543217",
        role: "student",
        branch: "EE",
        semester: 5,
        bio: "Electrical engineering student passionate about renewable energy",
      },
    ]);

    console.log("Users created successfully");

    // Create Sample Events
    const events = await Event.insertMany([
      {
        title: "Hackathon 2026",
        description:
          "24-hour coding marathon where teams compete to build innovative solutions. Prize pool worth ₹50,000. Food and refreshments provided throughout the event.",
        category: "Technical",
        startDate: new Date("2026-03-15T09:00:00"),
        endDate: new Date("2026-03-16T09:00:00"),
        venue: "Computer Lab - Block A",
        capacity: 100,
        registeredCount: 0,
        organizer: organizer1._id,
        tags: ["coding", "competition", "24hours", "prizes"],
        status: "upcoming",
        approvalStatus: "approved",
        approvedBy: admin._id,
      },
      {
        title: "AI & Machine Learning Workshop",
        description:
          "Learn the fundamentals of AI and ML with hands-on projects. Industry experts will guide you through neural networks, deep learning, and practical applications.",
        category: "Workshop",
        startDate: new Date("2026-02-20T10:00:00"),
        endDate: new Date("2026-02-20T17:00:00"),
        venue: "Seminar Hall - Block B",
        capacity: 80,
        registeredCount: 0,
        organizer: organizer1._id,
        tags: ["AI", "machine learning", "workshop", "hands-on"],
        status: "upcoming",
        approvalStatus: "approved",
        approvedBy: admin._id,
      },
      {
        title: "Annual Cultural Fest 2026",
        description:
          "Three-day extravaganza featuring music, dance, drama, fashion show, and celebrity performances. Open to all students. Multiple competitions and prizes to be won.",
        category: "Cultural",
        startDate: new Date("2026-04-05T09:00:00"),
        endDate: new Date("2026-04-07T22:00:00"),
        venue: "Main Auditorium & Open Ground",
        capacity: 500,
        registeredCount: 0,
        organizer: organizer2._id,
        tags: ["music", "dance", "cultural", "festival", "competition"],
        status: "upcoming",
        approvalStatus: "approved",
        approvedBy: admin._id,
      },
      {
        title: "Inter-College Cricket Tournament",
        description:
          "Annual cricket tournament with teams from 8 colleges. Professional umpires, trophies for winners and runners-up. Live commentary and refreshments.",
        category: "Sports",
        startDate: new Date("2026-03-10T08:00:00"),
        endDate: new Date("2026-03-12T18:00:00"),
        venue: "College Cricket Ground",
        capacity: 200,
        registeredCount: 0,
        organizer: organizer2._id,
        tags: ["cricket", "sports", "tournament", "inter-college"],
        status: "upcoming",
        approvalStatus: "pending",
      },
      {
        title: "Career Guidance Seminar",
        description:
          "Industry leaders share insights on career paths, interview preparation, and skill development. Q&A session included. Great networking opportunity.",
        category: "Academic",
        startDate: new Date("2026-02-28T14:00:00"),
        endDate: new Date("2026-02-28T17:00:00"),
        venue: "Conference Hall - Admin Block",
        capacity: 150,
        registeredCount: 0,
        organizer: organizer1._id,
        tags: ["career", "guidance", "seminar", "industry"],
        status: "upcoming",
        approvalStatus: "approved",
        approvedBy: admin._id,
      },
      {
        title: "Blood Donation Camp",
        description:
          "Annual blood donation drive in collaboration with City Blood Bank. Free health checkup and refreshments for all donors. Save lives, donate blood!",
        category: "Social",
        startDate: new Date("2026-02-25T09:00:00"),
        endDate: new Date("2026-02-25T16:00:00"),
        venue: "Medical Center",
        capacity: 100,
        registeredCount: 0,
        organizer: organizer2._id,
        tags: ["social", "health", "donation", "blood"],
        status: "upcoming",
        approvalStatus: "pending",
      },
      {
        title: "Web Development Bootcamp",
        description:
          "Intensive 5-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build a full-stack project. Certificates provided upon completion.",
        category: "Workshop",
        startDate: new Date("2026-03-01T09:00:00"),
        endDate: new Date("2026-03-05T17:00:00"),
        venue: "Lab 301 - IT Block",
        capacity: 60,
        registeredCount: 0,
        organizer: organizer1._id,
        tags: ["web development", "coding", "bootcamp", "full-stack"],
        status: "upcoming",
        approvalStatus: "approved",
        approvedBy: admin._id,
      },
      {
        title: "Photography Exhibition",
        description:
          "Showcase your photography skills! Theme: 'Campus Life'. Best entries will be displayed in the annual college magazine. Prizes for top 3 photographers.",
        category: "Cultural",
        startDate: new Date("2026-04-15T10:00:00"),
        endDate: new Date("2026-04-17T18:00:00"),
        venue: "Art Gallery - Student Center",
        capacity: 50,
        registeredCount: 0,
        organizer: organizer2._id,
        tags: ["photography", "art", "exhibition", "creative"],
        status: "upcoming",
        approvalStatus: "pending",
      },
    ]);

    console.log("Events created successfully");

    console.log("\n=== SEED DATA SUMMARY ===");
    console.log("\n👤 USER ACCOUNTS:");
    console.log("\n🔐 ADMIN:");
    console.log("   Email: admin@college.edu");
    console.log("   Password: admin123");
    console.log("   Role: admin");

    console.log("\n🎯 ORGANIZERS:");
    console.log("   1. Email: organizer1@college.edu");
    console.log("      Password: organizer123");
    console.log("      Role: organizer");
    console.log("\n   2. Email: organizer2@college.edu");
    console.log("      Password: organizer123");
    console.log("      Role: organizer");

    console.log("\n👨‍🎓 STUDENTS:");
    console.log("   1. Email: alice@college.edu");
    console.log("      Password: student123");
    console.log("      Role: student");
    console.log("\n   (4 more student accounts with similar pattern)");

    console.log("\n📅 EVENTS:");
    console.log(`   Total Events Created: ${events.length}`);
    console.log(
      `   Approved Events: ${events.filter((e) => e.approvalStatus === "approved").length}`,
    );
    console.log(
      `   Pending Events: ${events.filter((e) => e.approvalStatus === "pending").length}`,
    );

    console.log("\n✅ Database seeded successfully!");
    console.log(
      "🚀 You can now start the application and login with any of the above accounts.\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
