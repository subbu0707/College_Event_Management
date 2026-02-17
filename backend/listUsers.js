const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNumber: String,
  phone: String,
  branch: String,
  semester: Number,
  role: String,
});

const User = mongoose.model("User", userSchema);

// Fetch all users
async function listUsers() {
  try {
    const users = await User.find(
      {},
      "name email rollNumber phone branch semester role",
    );

    if (users.length === 0) {
      console.log("\n📋 No users registered yet.\n");
    } else {
      console.log("\n📋 Registered Users:\n");
      console.log(
        "═══════════════════════════════════════════════════════════════════════════",
      );
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Roll Number: ${user.rollNumber || "N/A"}`);
        console.log(`   Phone: ${user.phone || "N/A"}`);
        console.log(`   Branch: ${user.branch || "N/A"}`);
        console.log(`   Semester: ${user.semester || "N/A"}`);
        console.log(`   Role: ${user.role || "student"}`);
        console.log(
          "───────────────────────────────────────────────────────────────────────────",
        );
      });
      console.log(`\nTotal Users: ${users.length}\n`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }
}

listUsers();
