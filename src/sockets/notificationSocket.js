const userSockets = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Register user
    socket.on("register", (userId) => {
      if (!userSockets[userId]) userSockets[userId] = [];
      userSockets[userId].push(socket.id);
      console.log(`✔ User ${userId} registered → ${socket.id}`);
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      for (const userId in userSockets) {
        userSockets[userId] = userSockets[userId].filter(
          (id) => id !== socket.id
        );
        if (userSockets[userId].length === 0) delete userSockets[userId];
      }
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return userSockets;
};
