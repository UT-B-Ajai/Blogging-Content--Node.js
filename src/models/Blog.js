const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    cover_image: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    is_wishlist: {
    type: Number,
    default: 0, // 0 = not in wishlist, 1 = in wishlist
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

module.exports = mongoose.model("Blog", blogSchema);
