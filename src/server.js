const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

app.use("/api", authRoutes);
app.use("/api/blogs", blogRoutes);
// Blog images public access
app.use("/blog", express.static(path.join(__dirname, "public/blog")));
console.log("Static path:", path.join(__dirname, "public/blog"));


// Base route
app.get("/", (req, res) => {
  res.send("🚀 Blogging API running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
