const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactMessageRoutes = require("./routes/ContactMessageRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "SkillBridge API is running",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// User/Admin routes
app.use("/api/users", userRoutes);

// Service routes
app.use("/api/services", serviceRoutes);

// Request routes
app.use("/api/requests", requestRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Contact Message routes
app.use("/api/contact", contactMessageRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SkillBridge server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();