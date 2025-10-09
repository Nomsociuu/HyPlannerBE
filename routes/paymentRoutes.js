const express = require("express");
const router = express.Router();
const { createPaymentLink } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-link", protect, createPaymentLink);

module.exports = router;
