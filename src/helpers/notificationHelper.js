const Notification = require("../models/Notification");

exports.sendNotification = async (io, userSockets, userId,blog_id,title, body) => {
  try {
    // Save notification in MongoDB
    const notification = await Notification.create({
      user_id: userId,
      blog_id,
      title,
      body,
      read_status: false,
    });

    const socketIds = userSockets[userId];

    if (Array.isArray(socketIds) && socketIds.length > 0) {
      socketIds.forEach((socketId) =>
        io.of("/notifications").to(socketId).emit("push_notification", notification)
      );

      console.log(`📨 Sent notification to user ${userId}`);
    } else {
      console.log(`⚠ User ${userId} is offline, notification saved only.`);
    }
  } catch (err) {
    console.error("❌ Notification Error:", err.message);
  }
};

