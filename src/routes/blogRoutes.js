const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  ourBlogs,
} = require("../controllers/blogController");

// ✅ Routes protected by token
router.post("/", protect, createBlog);
router.get("/", protect, getBlogs);
router.get("/my", protect, ourBlogs);
router.get("/:id", protect, getBlogById);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
