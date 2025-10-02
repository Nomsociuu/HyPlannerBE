const payOs = require("../config/payos");
const Order = require("../models/Order");
const User = require("../models/User");
const { APIError } = require("@payos/node");

const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

/**
 * @desc    Tạo link thanh toán PayOS
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

  const orderCode = Date.now();

  try {
    const newOrder = new Order({
      userId,
      packageType,
      amount: price,
      orderCode,
    });
    await newOrder.save();

    const payosOrder = {
      amount: price,
      description: description,
      orderCode: orderCode,
      returnUrl: `${APP_SCHEME}://payment-success`,
      cancelUrl: `${APP_SCHEME}://payment-cancelled`,
      buyerName: req.user.fullName,
      buyerEmail: req.user.email,
    };

    // ----- SỬA LẠI PHƯƠNG THỨC GỌI Ở ĐÂY -----
    const paymentLinkResponse = await payOs.paymentRequests.create(payosOrder);
    // ------------------------------------------

    res.status(200).json({
      message: "Tạo link thanh toán thành công",
      checkoutUrl: paymentLinkResponse.checkoutUrl,
    });
  } catch (error) {
    console.error("Lỗi khi tạo link thanh toán:", error);

    // Bắt lỗi cụ thể từ PayOS để log chi tiết hơn
    if (error instanceof APIError) {
      console.error("Lỗi từ PayOS:", error.error);
    }

    res.status(500).json({ message: "Không thể tạo link thanh toán." });
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
    // Xác thực webhook
    const verifiedData = payOs.verifyPaymentWebhook(webhookData);

    // Chỉ xử lý khi thanh toán thành công
    if (verifiedData.code === "00" && verifiedData.desc === "Success") {
      console.log(
        `Webhook xác thực thành công cho đơn hàng: ${verifiedData.data.orderCode}`
      );
      const orderCode = verifiedData.data.orderCode;

      // Tìm đơn hàng trong DB của bạn
      const order = await Order.findOne({ orderCode });

      // Kiểm tra xem đơn hàng có tồn tại và đang ở trạng thái PENDING không
      if (order && order.status === "PENDING") {
        // Cập nhật trạng thái đơn hàng thành COMPLETED
        order.status = "COMPLETED";
        await order.save();

        // === LOGIC NÂNG CẤP TÀI KHOẢN NGƯỜI DÙNG ===
        const user = await User.findById(order.userId);
        if (user) {
          if (order.packageType === "VIP") {
            user.accountType = "VIP";
            // Set ngày hết hạn là 1 năm kể từ hôm nay
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            user.accountExpires = expiryDate;
          } else if (order.packageType === "SUPER") {
            user.accountType = "SUPER";
            user.accountExpires = null; // Hoặc một ngày rất xa trong tương lai
          }
          await user.save();
          console.log(
            `Đã nâng cấp tài khoản cho User ID: ${user._id} thành ${user.accountType}`
          );
        }
      }
    }

    // Luôn phản hồi 200 cho PayOS để tránh bị gọi lại webhook
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Lỗi xác thực webhook:", error.message);
    return res.status(400).json({ message: "Webhook verification failed" });
  }
};

module.exports = {
  createPaymentLink,
  handlePayOsWebhook,
};
