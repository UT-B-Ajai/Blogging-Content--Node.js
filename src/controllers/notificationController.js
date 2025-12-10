const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

// ✅ Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({
      user_id: userId,
      read_status: false
    }).sort({ createdAt: -1 });
    return successResponse(res, notifications, "Notifications fetched");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// ✅ Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { read_status: true },
      { new: true }
    );

    if (!notification) return errorResponse(res, "Notification not found", 404);

    return successResponse(res, notification, "Notification marked as read");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};


// ✅ Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user_id: userId, read_status: false },
      { read_status: true }
    );

    return successResponse(res, null, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
