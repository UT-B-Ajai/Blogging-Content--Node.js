const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/blogController");

// ✅ Routes protected by token
router.post("/", protect, addToWishlist);
router.delete("/", protect, removeFromWishlist);
module.exports = router;
