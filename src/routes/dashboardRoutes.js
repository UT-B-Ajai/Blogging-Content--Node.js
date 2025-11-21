const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getdashboardData,
} = require("../controllers/dashboardController");

// ✅ Routes protected by token
router.get("/", protect, getdashboardData);

module.exports = router;
