const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    deleted_at: {
      type: Date,
      default: null, // set when soft deleted
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // ✅ rename timestamp fields
  }
);

module.exports = mongoose.model("User", userSchema);
