const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

/**
 * @desc    Upload avatar lên Cloudinary
 * @route   POST /upload/avatar
 * @access  Private
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Không có file ảnh được tải lên");
  }

  // Cloudinary tự động upload file qua multer middleware
  // req.file.path chứa URL của ảnh trên Cloudinary
  const avatarUrl = req.file.path;

  // Cập nhật avatar trong database
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  // Xóa ảnh cũ trên Cloudinary nếu có
  if (user.picture && user.picture.includes("cloudinary.com")) {
    try {
      // Lấy public_id từ URL
      const urlParts = user.picture.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `hyplanner/avatars/${publicIdWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting old avatar from Cloudinary:", error);
      // Không throw error vì việc xóa ảnh cũ không critical
    }
  }

  // Cập nhật URL mới
  user.picture = avatarUrl;
  await user.save();

  res.status(200).json({
    message: "Upload avatar thành công",
    avatarUrl: avatarUrl,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      picture: user.picture,
    },
  });
});

/**
 * @desc    Upload ảnh bài viết lên Cloudinary
 * @route   POST /upload/post-images
 * @access  Private
 */
exports.uploadPostImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("Không có file ảnh được tải lên");
  }

  // req.files là mảng các file đã được upload lên Cloudinary
  const imageUrls = req.files.map((file) => file.path);

  res.status(200).json({
    message: "Upload ảnh bài viết thành công",
    imageUrls: imageUrls,
  });
});
