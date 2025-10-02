const express = require("express");
const router = express.Router();
const {
  createInvitationLetter,
  getUserInvitation,
  deleteUserInvitation,
} = require("../controllers/invitationLetterController");
const { protect } = require("../middleware/authMiddleware");

// Route tạo website mới
router.post("/invitation-letters", protect, createInvitationLetter);

// Route lấy thông tin website của user
router.get("/my-invitation", protect, getUserInvitation);

// Route xóa website của user
router.delete("/my-invitation", protect, deleteUserInvitation);

module.exports = router;
