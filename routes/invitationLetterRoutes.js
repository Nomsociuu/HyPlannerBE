const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  createInvitationLetter,
  getUserInvitation,
  deleteUserInvitation,
  updateUserInvitation,
  addGuestbookMessage,
  incrementRsvpCount,
} = require("../controllers/invitationLetterController");
const { protect } = require("../middleware/authMiddleware");

const rsvpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 ngày (tính bằng mili-giây)
  max: 3, // Chỉ cho phép 3 request từ 1 IP trong 1 ngày
  message: {
    message: "Bạn đã xác nhận quá nhiều lần. Vui lòng thử lại sau 1 ngày.",
  },
  standardHeaders: true, // Gửi thông tin về rate limit trong header
  legacyHeaders: false, // Tắt header X-RateLimit-* cũ
  validate: {
    xForwardedForHeader: false, // Tắt warning vì đã set trust proxy
    trustProxy: false, // Tắt warning
  },
});

const addWishLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 ngày (tính bằng mili-giây)
  max: 1, // Chỉ cho phép 1 request từ 1 IP trong 1 ngày
  message: {
    message: "Bạn đã gửi quá nhiều lời chúc. Vui lòng thử lại sau 1 ngày.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    trustProxy: false,
  },
});

// Route tạo website mới
router.post("/invitation-letters", protect, createInvitationLetter);

// Route lấy thông tin website của user
router.get("/my-invitation", protect, getUserInvitation);

// Route xóa website của user
router.delete("/my-invitation", protect, deleteUserInvitation);

// --- THÊM ROUTE MỚI ĐỂ CẬP NHẬT ---
router.put("/my-invitation", protect, updateUserInvitation);

// --- THÊM ROUTE MỚI ĐỂ NHẬN LỜI CHÚC ---
router.post("/:slug/add-wish", addWishLimiter, addGuestbookMessage);

// --- 2. THÊM ROUTE MỚI CHO RSVP ---
router.post("/:slug/rsvp", rsvpLimiter, incrementRsvpCount);

module.exports = router;
