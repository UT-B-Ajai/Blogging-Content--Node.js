const multer = require("multer");
const path = require("path");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Wishlist = require("../models/Wishlist");
const { successResponse, errorResponse ,getPagination } = require("../helpers/responseHelper");
const e = require("express");
const { log } = require("console");

// ✅ Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/blog");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "_" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});

// ✅ Multer upload instance
const upload = multer({ storage }).fields([
  { name: "image", maxCount: 1 },
  { name: "cover_image", maxCount: 1 },
]);

// ✅ CREATE BLOG
exports.createBlog = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, err.message, 400);

    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return errorResponse(res, "Title and content are required", 400);
      }

      const image = req.files?.image?.[0]?.filename || null;
      const coverImage = req.files?.cover_image?.[0]?.filename || null;

      const blog = await Blog.create({
        user_id: req.user.id,
        title,
        content,
        image,
        cover_image: coverImage,
      });

      return successResponse(res, blog, "Blog created successfully", 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  });
};

// ✅ UPDATE BLOG
exports.updateBlog = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, err.message, 400);

    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return errorResponse(res, "Blog not found", 404);

      const image = req.files?.image?.[0]?.filename || blog.image;
      const coverImage = req.files?.cover_image?.[0]?.filename || blog.cover_image;

      blog.title = req.body.title || blog.title;
      blog.content = req.body.content || blog.content;
      blog.image = image;
      blog.cover_image = coverImage;

      await blog.save();
      return successResponse(res, blog, "Blog updated successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  });
};

// ✅ GET ALL BLOGS
exports.getBlogs = async (req, res) => {
  try {
    let { page, perPage, search = "" } = req.query;

    search = search.trim();
    const searchCondition = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const paginationEnabled = page && perPage;
    let blogs;
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    // get logged user ID (optional)
    const userId = req.user ? req.user.id : null;

    if (paginationEnabled) {
      page = Number(page);
      perPage = Number(perPage);

      const totalRecords = await Blog.countDocuments(searchCondition);

      blogs = await Blog.find(searchCondition)
        .populate("user_id", "name email")
        .sort({ created_at: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      const finalBlogs = await Promise.all(
        blogs.map(async (blog, index) => {
          const isWishlisted = userId
            ? await Wishlist.findOne({ user_id: userId, blog_id: blog._id })
            : null;

          return {
            s_no: (page - 1) * perPage + index + 1,
            ...blog._doc,
            image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
            cover_image_url: blog.cover_image
              ? `${baseUrl}/blog/${blog.cover_image}`
              : null,
            author: blog.user_id?.name,
            is_wishlist: !!isWishlisted,
          };
        })
      );

      return successResponse(
        res,
        {
          blogs: finalBlogs,
          pagination: getPagination(page, perPage, totalRecords),
        },
        "Blogs fetched successfully"
      );
    }

    // NO PAGINATION
    blogs = await Blog.find(searchCondition)
      .populate("user_id", "name email")
      .sort({ created_at: -1 });

    const finalBlogs = await Promise.all(
      blogs.map(async (blog, index) => {
        const isWishlisted = userId
          ? await Wishlist.findOne({ user_id: userId, blog_id: blog._id })
          : null;

        return {
          s_no: index + 1,
          ...blog._doc,
          image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
          cover_image_url: blog.cover_image
            ? `${baseUrl}/blog/${blog.cover_image}`
            : null,
          author: blog.user_id?.name,
          is_wishlist: !!isWishlisted,
        };
      })
    );

    return successResponse(
      res,
      { blogs: finalBlogs },
      "Blogs fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


exports.ourBlogs = async (req, res) => {
  try {
    let { page, perPage, search = "" } = req.query;
    search = search.trim();

    const userId = req.user._id;

    // Search condition
    const searchCondition = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // FINAL FILTER: show only logged-in user's blogs
    const filter = {
      user_id: userId,
      ...searchCondition,
    };

    const paginationEnabled = page && perPage;
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    let blogs;

    if (paginationEnabled) {
      page = Number(page);
      perPage = Number(perPage);

      const totalRecords = await Blog.countDocuments(filter);

      blogs = await Blog.find(filter)
        .populate("user_id", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

 const finalBlogs = await Promise.all(
      blogs.map(async (blog, index) => {
        // Check if this blog is in the logged-in user's wishlist
        const isWishlisted = await Wishlist.findOne({
          user_id: userId,
          blog_id: blog._id,
        });

        return {
          s_no: (page - 1) * perPage + index + 1,
          ...blog._doc,
          image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
          cover_image_url: blog.cover_image
            ? `${baseUrl}/blog/${blog.cover_image}`
            : null,
          author: blog.user_id?.name,
          is_wishlist: !!isWishlisted, // ❤️ red heart only if user added
        };
      })
    );

      return successResponse(
        res,
        {
          blogs: finalBlogs,
          pagination: getPagination(page, perPage, totalRecords),
        },
        "Blogs fetched successfully"
      );
    }

    // WITHOUT PAGINATION
    blogs = await Blog.find(filter)
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });

    const finalBlogs = blogs.map((blog, index) => ({
      s_no: index + 1,
      ...blog._doc,
      image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
      cover_image_url: blog.cover_image
        ? `${baseUrl}/blog/${blog.cover_image}`
        : null,
      author: blog.user_id?.name,
    }));

    return successResponse(res, { blogs: finalBlogs }, "Blogs fetched successfully");

  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ✅ GET BLOG BY ID
// exports.getBlogById = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id).populate("user_id", "name email");
//     if (!blog) return errorResponse(res, "Blog not found", 404);

//     return successResponse(res, blog, "Blog fetched successfully");
//   } catch (error) {
//     return errorResponse(res, error.message);
//   }
// };
exports.getBlogById = async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const blog = await Blog.findById(req.params.id)
      .populate("user_id", "name email");

    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }
        // Generate image URLs
    const blogData = {
      ...blog.toObject(),
      image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
      cover_image_url: blog.cover_image
        ? `${baseUrl}/blog/${blog.cover_image}`
        : null,
    };

    const comments = await Comment.find({ blog_id: req.params.id })
      .populate("user_id", "name email")
      .sort({ created_at: -1 });

    const formattedComments = comments.map((c) => ({
      _id: c._id,
      comment: c.comment,
      user: c.user_id,
      created_at: c.created_at,   
    }));

    const responseData = {
      blog: blogData,
      comments: formattedComments,
    };

    return successResponse(res, responseData, "Blog fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};


// ✅ DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found", 404);

    await blog.deleteOne();
    return successResponse(res, null, "Blog deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.user.id; // from token

    const already = await Wishlist.findOne({ user_id, blog_id });
    if (already)
      return successResponse(res, null, "Already added to wishlist");

    const data = await Wishlist.create({ user_id, blog_id });

    return successResponse(res, data, "Blog added to wishlist");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


exports.removeFromWishlist = async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.user.id;

    await Wishlist.findOneAndDelete({ user_id, blog_id });

    return successResponse(res, null, "Blog removed from wishlist");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
