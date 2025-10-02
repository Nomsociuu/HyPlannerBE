const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageType: {
      type: String,
      enum: ["VIP", "SUPER"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // Đây là mã đơn hàng duy nhất bạn gửi cho PayOS
    orderCode: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
