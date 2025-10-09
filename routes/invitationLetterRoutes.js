const express = require("express");
const router = express.Router();
const {
  createInvitationLetter,
  getUserInvitation,
  deleteUserInvitation,
  updateUserInvitation,
} = require("../controllers/invitationLetterController");
const { protect } = require("../middleware/authMiddleware");

// Route tạo website mới
router.post("/invitation-letters", protect, createInvitationLetter);

// Route lấy thông tin website của user
router.get("/my-invitation", protect, getUserInvitation);

// Route xóa website của user
router.delete("/my-invitation", protect, deleteUserInvitation);

// --- THÊM ROUTE MỚI ĐỂ CẬP NHẬT ---
router.put("/my-invitation", protect, updateUserInvitation);

module.exports = router;
