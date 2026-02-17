require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/college_event_management",
    );
    console.log("✅ MongoDB Connected\n");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

const createUser = async () => {
  try {
    await connectDB();

    console.log("=== Create New Student User ===\n");

    const name = await question("Enter full name: ");
    const email = await question("Enter email: ");
    const rollNumber = await question("Enter roll number: ");
    const phone = await question("Enter phone (10 digits): ");
    const branch = await question("Enter branch (CSE/ECE/ME/CE/EE/Other): ");
    const semester = await question("Enter semester (1-8): ");
    const password = await question("Enter password (min 6 chars): ");

    // Validate inputs
    if (
      !name ||
      !email ||
      !rollNumber ||
      !phone ||
      !branch ||
      !semester ||
      !password
    ) {
      console.log("\n❌ All fields are required!");
      process.exit(1);
    }

    if (password.length < 6) {
      console.log("\n❌ Password must be at least 6 characters!");
      process.exit(1);
    }

    if (!/^\d{10}$/.test(phone)) {
      console.log("\n❌ Phone must be exactly 10 digits!");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { rollNumber }],
    });
    if (existingUser) {
      console.log("\n❌ User with this email or roll number already exists!");
      process.exit(1);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      rollNumber,
      phone,
      branch,
      semester: parseInt(semester),
    });

    console.log("\n✅ User created successfully!");
    console.log("\n=== Login Credentials ===");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Roll Number: ${rollNumber}`);
    console.log(
      "\nYou can now login to the application with these credentials.",
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating user:", error.message);
    process.exit(1);
  }
};

createUser();
