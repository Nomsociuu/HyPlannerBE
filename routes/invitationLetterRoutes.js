const express = require("express");
const router = express.Router();
const {
  createInvitationLetter,
} = require("../controllers/invitationLetterController");
const { protect } = require("../middleware/authMiddleware");

// Khi có một request POST đến '/api/invitation-letters'
// 1. Nó sẽ chạy qua middleware 'protect' để xác thực token.
// 2. Nếu token hợp lệ, nó sẽ chạy tiếp vào controller 'createInvitationLetter'.
router.post("/invitation-letters", protect, createInvitationLetter);

module.exports = router;
