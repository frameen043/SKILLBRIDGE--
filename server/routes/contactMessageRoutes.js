const express = require("express");

const {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
} = require("../controllers/ContactMessageController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Public: Submit a contact message
router.post(
  "/",
  createContactMessage
);

// Admin: View all contact messages
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllContactMessages
);

// Admin: Mark a contact message as read/unread
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateContactMessageStatus
);

module.exports = router;