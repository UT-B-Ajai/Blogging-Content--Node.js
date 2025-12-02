const multer = require("multer");
const User = require("../models/User");
const { successResponse, errorResponse ,getPagination } = require("../helpers/responseHelper");



// ✅ GET ALL UserS
exports.getUsers = async (req, res) => {
  try {
    // 1️⃣ Extract query parameters with defaults
    let { page = 1, perPage = 10, search = "" } = req.query;

    // 2️⃣ Ensure correct types
    page = parseInt(page, 10) || 1;
    perPage = parseInt(perPage, 10) || 10;
    search = search.trim();

     let baseCondition = { deleted_at: null };
    // 3️⃣ Build search condition (case-insensitive)
    const searchCondition = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

     const finalCondition = { ...baseCondition, ...searchCondition };
    // 4️⃣ Get total count for pagination
    const totalRecords = await User.countDocuments(finalCondition);

    // 4️⃣ Fetch paginated users
    const users = await User.find(finalCondition)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    // 5️⃣ Add serial numbers
    const finalUsers = users.map((user, index) => ({
      s_no: (page - 1) * perPage + index + 1,
      ...user,
    }));

    // 6️⃣ Pagination
    const pagination = getPagination(page, perPage, totalRecords);

    // 8️⃣ Send success response
    return successResponse(
      res,
      { users: finalUsers, pagination },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorResponse(res, error.message || "Internal Server Error");
  }
};



// ✅ GET User BY ID
exports.getUserById = async (req, res) => {
  try {
    const User = await User.findById(req.params.id);
    if (!User) return errorResponse(res, "User not found", 404);

    return successResponse(res, User, "User fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ✅ DELETE User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);
console.log(user, "user");

     user.deleted_at = new Date(); // add timestamp
    await user.save();
    return successResponse(res, null, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
