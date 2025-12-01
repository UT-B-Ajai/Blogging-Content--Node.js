const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
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

module.exports = mongoose.model("Comment", commentSchema);
