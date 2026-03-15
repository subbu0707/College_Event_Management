const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/college_event_management";

    await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
    });

    const host =
      mongoose.connection.host ||
      (mongoose.connection.client &&
      mongoose.connection.client.s &&
      mongoose.connection.client.s.url
        ? mongoose.connection.client.s.url
        : "connected");

    console.log(`MongoDB Connected: ${host}`);
    return mongoose.connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
