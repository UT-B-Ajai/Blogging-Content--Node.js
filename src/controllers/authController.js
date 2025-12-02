const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

// ✅ REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name) return errorResponse(res, "Name must be required", 400);

    if (!validator.isEmail(email))
      return errorResponse(res, "Invalid email format", 400);

    if (!validator.isLength(password, { min: 6 }))
      return errorResponse(res, "Password must be at least 6 characters long", 400);

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return errorResponse(res, "Email already registered", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    return successResponse(
      res,
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, "Internal Server Error");
  }
};

// ✅ LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return errorResponse(res, "Email and password are required", 400);

    // Find user by email
    const user = await User.findOne({ email });

    // User not found
    if (!user) return errorResponse(res, "User not registered", 404);

    // Check if the user is soft-deleted
    if (user.deleted_at !== null) {
      return errorResponse(
        res,
        "Your account has been deleted by admin",
        403
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Incorrect password", 400);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Internal Server Error");
  }
};


module.exports = { registerUser, loginUser };
