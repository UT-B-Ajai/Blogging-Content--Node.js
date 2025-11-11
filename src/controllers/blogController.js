const multer = require("multer");
const path = require("path");
const Blog = require("../models/Blog");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

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
    const blogs = await Blog.find().sort({ createdAt: -1 });

    const baseUrl = process.env.BASE_URL;

    const finalBlogs = blogs.map(blog => ({
      ...blog._doc,
      image_url: blog.image ? `${baseUrl}/blog/${blog.image}` : null,
      cover_image_url: blog.cover_image ? `${baseUrl}/blog/${blog.cover_image}` : null,
    }));

    return successResponse(res, finalBlogs, "Blogs fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


// ✅ GET BLOG BY ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found", 404);

    return successResponse(res, blog, "Blog fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
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
