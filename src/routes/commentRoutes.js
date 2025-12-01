const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  addComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// ✅ Routes protected by token
router.post("/", protect, addComment);
router.get("/", protect, getComments);
router.get("/:id", protect, getCommentById);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
