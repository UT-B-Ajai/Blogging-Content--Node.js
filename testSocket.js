const io = require("socket.io-client");

const socket = io("http://localhost:5000/notifications", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🔌 Connected socket:", socket.id);

  // Register userId with server
  socket.emit("register", "692e7f79402c4982ee8eb5c6"); // admin ID
});

socket.on("push_notification", (data) => {
  console.log("🔔 Notification received:", data);
});
