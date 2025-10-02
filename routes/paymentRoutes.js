const express = require("express");
const router = express.Router();
const {
  createPaymentLink,
  handlePayOsWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-link", protect, createPaymentLink);
router.post("/webhook", handlePayOsWebhook);

module.exports = router;
