const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Cấu hình storage cho multer sử dụng Cloudinary (Avatar)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hyplanner/avatars", // Thư mục lưu trữ trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }], // Tự động resize
  },
});

// Cấu hình storage cho ảnh bài viết (Post images)
const postImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hyplanner/posts", // Thư mục riêng cho ảnh bài viết
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }], // Giới hạn kích thước
  },
});

const uploadCloud = multer({ storage: storage });
const uploadPostImages = multer({ storage: postImageStorage });

module.exports = { cloudinary, upload: uploadCloud, uploadPostImages };
