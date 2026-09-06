const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get notifications for the authenticated user
router.get(
  "/",
  protect,
  getMyNotifications
);

// Mark a notification as read
router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

module.exports = router;