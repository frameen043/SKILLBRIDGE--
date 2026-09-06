const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Get notifications for the authenticated user
const getMyNotifications = async (req, res) => {
try {
const recipientId = req.user._id || req.user.id;


const notifications = await Notification.find({
  recipientId,
}).sort({
  createdAt: -1,
});

return res.status(200).json({
  notifications,
});


} catch (error) {
console.error("Error fetching notifications:", error);


return res.status(500).json({
  message: "Server error while fetching notifications.",
});


}
};

// Mark one of the authenticated user's notifications as read
const markNotificationAsRead = async (req, res) => {
try {
const { id } = req.params;


if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({
    message: "Invalid notification ID.",
  });
}

const recipientId = req.user._id || req.user.id;

const notification = await Notification.findOne({
  _id: id,
  recipientId,
});

if (!notification) {
  return res.status(404).json({
    message: "Notification not found.",
  });
}

notification.isRead = true;
await notification.save();

return res.status(200).json({
  message: "Notification marked as read.",
  notification,
});


} catch (error) {
console.error("Error updating notification:", error);


return res.status(500).json({
  message: "Server error while updating notification.",
});


}
};

module.exports = {
getMyNotifications,
markNotificationAsRead,
};
