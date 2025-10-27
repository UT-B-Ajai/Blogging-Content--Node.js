const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errorResponse } = require("../helpers/responseHelper");

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return errorResponse(res, "Not authorized, token failed", 401);
    }
  } else {
    return errorResponse(res, "No token provided", 401);
  }
};
