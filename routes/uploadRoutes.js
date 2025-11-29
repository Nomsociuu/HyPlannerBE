const express = require("express");
const router = express.Router();
const {
  uploadAvatar,
  uploadPostImages,
  uploadAlbumImages,
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

// Route upload ảnh album (tối đa 10 ảnh)
router.post(
  "/album-images",
  protect,
  uploadPost.array("images", 10),
  uploadAlbumImages
);

module.exports = router;
