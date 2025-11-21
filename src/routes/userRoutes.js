const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userController");

// ✅ Routes protected by token
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
// router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
