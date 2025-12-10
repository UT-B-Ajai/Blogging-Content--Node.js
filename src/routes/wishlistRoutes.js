const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  addToWishlist,
  removeFromWishlist,
  myWishlist
} = require("../controllers/blogController");

// ✅ Routes protected by token
router.get("/", protect, myWishlist);
router.post("/", protect, addToWishlist);
router.delete("/", protect, removeFromWishlist);
module.exports = router;
