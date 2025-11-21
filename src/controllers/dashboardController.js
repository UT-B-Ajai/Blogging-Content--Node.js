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

    // Prepare response
    const dashboardData = {
      total_users: userCount,
      total_blogs: blogCount
    };

    return successResponse(res, dashboardData, "Dashboard data fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

