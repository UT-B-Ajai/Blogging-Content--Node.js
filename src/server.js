// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// ===== SOCKET.IO SETUP =====
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// After initializing io
const notificationSocket = require("./sockets/notificationSocket");
const userSockets = notificationSocket(io.of("/notifications"));

// Attach io & userSockets to requests
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});
// =============================
// 🚀 ROUTES
// =============================
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications",notificationRoutes);

// Public static folder for blog images
app.use("/blog", express.static(path.join(__dirname, "public/blog")));

// Base route
app.get("/", (req, res) => {
  res.send("🚀 Server & Socket.io running successfully!");
});

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 Node.js server running at http://localhost:${PORT}`);
});
