const express = require("express");
const router = express.Router();
const {
  uploadAvatar,
  uploadPostImages,
} = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  uploadPostImages: uploadPost,
} = require("../config/cloudinary");

// Route upload avatar
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

// Route upload ảnh bài viết (tối đa 5 ảnh)
router.post(
  "/post-images",
  protect,
  uploadPost.array("images", 5),
  uploadPostImages
);

module.exports = router;
