const multer = require("multer");
const User = require("../models/User");
const Blog = require("../models/Blog");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

exports.getdashboardData = async (req, res) => {
  try {
    // Count total users
    const userCount = await User.countDocuments();

    // Count total blogs
    const blogCount = await Blog.countDocuments();

    // Count wishlist blogs (is_wishlist = 1)
    const wishlistCount = await Blog.countDocuments({ is_wishlist: 1 });

    // Prepare response
    const dashboardData = {
      total_users: userCount,
      total_blogs: blogCount,
      total_wishlist: wishlistCount
    };

    return successResponse(res, dashboardData, "Dashboard data fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

