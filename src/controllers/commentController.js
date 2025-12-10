const Comment = require("../models/Comment");
const { sendNotification } = require("../helpers/notificationHelper");
const {
  successResponse,
  errorResponse,
  getPagination,
} = require("../helpers/responseHelper");
const { sendMail } = require("../helpers/mailer");
const Blog = require("../models/Blog");

exports.addComment = async (req, res) => {
  try {
    const { blog_id, comment } = req.body;

    const userId = req.user.id;
    console.log(userId, "userId");

    // Create comment
    const newComment = await Comment.create({
      blog_id,
      user_id: userId,
      comment,
    });

    // Get blog & author
    const blog = await Blog.findById(blog_id).populate("user_id", "name email");
    if (!blog) return errorResponse(res, "Blog not found", 404);

    const blogAuthorId = blog.user_id._id.toString();
    const blogTitle = blog.title;

    // ❗ Avoid notifying yourself
    if (blogAuthorId !== userId) {
      await sendNotification(
        req.io,
        req.userSockets,
        blogAuthorId, 
        blog_id,
        "New Comment Added",
        `A new comment was added to your blog "${blogTitle}".`
      );
    }

    return successResponse(res, newComment, "Comment added successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getComments = async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query.page, req.query.limit);
    const comments = await Comment.find({ deleted_at: null })
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalRecords = await Comment.countDocuments({ deleted_at: null });
    return successResponse(
      res,
      { comments, pagination: getPagination(page, limit, totalRecords) },
      "Comments fetched successfully"
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      deleted_at: null,
    }).populate("user_id", "name email");
    if (!comment) {
      return errorResponse(res, "Comment not found", 404);
    }
    return successResponse(res, comment, "Comment fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    const existing = await Comment.findById(comment_id);
    if (!existing) return errorResponse(res, "Comment not found", 404);

    // Check permission
    if (String(existing.user_id) !== user_id) {
      return errorResponse(res, "Not allowed to edit this comment", 403);
    }

    existing.comment = comment;
    await existing.save();

    return successResponse(res, existing, "Comment updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    const comment = await Comment.findById(comment_id).populate("blog_id");
    if (!comment) return errorResponse(res, "Comment not found", 404);

    const blogOwner = String(comment.blog_id.user_id);
    const commentOwner = String(comment.user_id);

    // Permission check
    if (
      user_id !== commentOwner &&
      user_id !== blogOwner &&
      req.user.role !== "admin"
    ) {
      return errorResponse(res, "Not allowed to delete this comment", 403);
    }

    // Remove from blog list
    await Blog.findByIdAndUpdate(comment.blog_id._id, {
      $pull: { comments: comment_id },
    });

    await Comment.findByIdAndDelete(comment_id);

    return successResponse(res, null, "Comment deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
