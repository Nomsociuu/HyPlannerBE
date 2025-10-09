// controllers/paymentController.js (Phiên bản đã tích hợp)
const mongoose = require("mongoose");
const payOs = require("../config/payos"); // Đảm bảo bạn đã khởi tạo payOs ở file này
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { APIError } = require("@payos/node");

// Lấy scheme của app từ biến môi trường để làm deep link
const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

/**
 * @desc    Tạo link thanh toán PayOS để nâng cấp tài khoản
 * @route   POST /api/payments/create-link
 * @access  Private
 */
const createPaymentLink = async (req, res) => {
  const { description, price, packageType } = req.body;
  const userId = req.user.id;

  if (!description || !price || !packageType) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp đủ thông tin thanh toán." });
  }

  // Sử dụng Mongoose Transaction để đảm bảo an toàn dữ liệu
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderCode = Date.now(); // Tạo orderCode duy nhất

    // 1. Tạo đối tượng PayOS Order
    const payosOrder = {
      amount: price,
      description: description,
      orderCode: orderCode,
      // Sử dụng deep link để quay lại app
      returnUrl: `${APP_SCHEME}://upgrade-account?status=success&orderCode=${orderCode}`,
      cancelUrl: `${APP_SCHEME}://upgrade-account?status=cancelled`,
      buyerName: req.user.fullName || req.user.email,
      buyerEmail: req.user.email,
    };

    // 2. Gọi API PayOS để tạo link thanh toán
    const paymentLinkResponse = await payOs.paymentRequests.create(payosOrder);

    // 3. Nếu tạo link thành công, LƯU đơn hàng vào DB
    const newOrder = new Order({
      userId,
      packageType,
      amount: price,
      orderCode,
      status: "PENDING",
    });
    await newOrder.save({ session });

    // 4. Commit transaction nếu mọi thứ thành công
    await session.commitTransaction();

    res.status(200).json({
      message: "Tạo link thanh toán thành công",
      checkoutUrl: paymentLinkResponse.checkoutUrl,
    });
  } catch (error) {
    // Nếu có lỗi ở bất kỳ bước nào, hủy bỏ transaction
    await session.abortTransaction();
    console.error("Lỗi khi tạo link thanh toán:", error);
    if (error instanceof APIError) {
      console.error("Lỗi từ PayOS:", error.error);
    }
    res.status(500).json({ message: "Không thể tạo link thanh toán." });
  } finally {
    // Luôn kết thúc session
    session.endSession();
  }
};

/**
 * @desc    Nhận và xử lý webhook từ PayOS
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handlePayOsWebhook = async (req, res) => {
  const webhookData = req.body;
  try {
    // Sử dụng hàm xác thực có sẵn của SDK - an toàn và tiện lợi
    const verifiedData = payOs.verifyPaymentWebhook(webhookData);

    // Chỉ xử lý khi thanh toán thành công
    if (verifiedData.code === "00") {
      console.log(
        `[WEBHOOK] Xác thực thành công cho đơn hàng: ${verifiedData.data.orderCode}`
      );
      const orderCode = verifiedData.data.orderCode;

      const order = await Order.findOne({ orderCode: Number(orderCode) });

      if (order && order.status === "PENDING") {
        order.status = "COMPLETED";
        await order.save();

        const user = await User.findById(order.userId);
        if (user) {
          if (order.packageType === "VIP") {
            user.accountType = "VIP";
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            user.accountExpires = expiryDate;
          } else if (order.packageType === "SUPER") {
            user.accountType = "SUPER";
            user.accountExpires = null; // Trọn đời
          }
          await user.save();
          console.log(
            `[WEBHOOK] Đã nâng cấp tài khoản User ID: ${user._id} thành ${user.accountType}`
          );
        }
      } else {
        console.log(
          `[WEBHOOK] Bỏ qua. Đơn hàng ${orderCode} không tìm thấy hoặc đã được xử lý.`
        );
      }
    }

    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("[WEBHOOK] Lỗi xác thực webhook:", error.message);
    return res.status(400).json({ message: "Webhook verification failed" });
  }
};

module.exports = {
  createPaymentLink,
  handlePayOsWebhook,
};
