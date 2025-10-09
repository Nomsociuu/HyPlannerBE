const express = require("express");
const router = express.Router();
const {
  createPaymentLink,
  handleCancelOrder, // Import hàm mới
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-link", protect, createPaymentLink);

// ROUTE MỚI ĐỂ XỬ LÝ HỦY ĐƠN
router.post("/cancel-order", protect, handleCancelOrder);

// Lưu ý: route /webhook đã được chuyển ra file index.js để xử lý raw body
// router.post("/webhook", handlePayOsWebhook);

module.exports = router;
