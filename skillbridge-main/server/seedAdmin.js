require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const adminEmail = "admin@skillbridge.com";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists. No new admin was created.");
      return;
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash("Admin123", 10);

    // Create admin
    await User.create({
      name: "SkillBridge Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      status: "approved",
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exitCode = 1;
  } finally {
    // Disconnect from MongoDB
    await mongoose.connection.close();
  }
};

seedAdmin();