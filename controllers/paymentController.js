const payOs = require("../config/payos");
const Order = require("../models/Order");
const User = require("../models/User");
const { APIError } = require("@payos/node");

const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

/**
 * @desc    Tạo link thanh toán PayOS (Logic cuối cùng: Luôn tạo đơn mới và hủy các đơn PENDING cũ)
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

  try {
    // --- LOGIC MỚI: HỦY CÁC ĐƠN PENDING CŨ TRONG DB ---
    // Tìm và cập nhật tất cả các đơn hàng PENDING cũ của user này thành CANCELLED
    await Order.updateMany(
      { userId, status: "PENDING", packageType },
      { $set: { status: "CANCELLED" } }
    );
    console.log(`Đã hủy các đơn hàng PENDING cũ của user: ${userId}`);
    // ----------------------------------------------------

    // --- LUÔN TẠO MỘT ĐƠN HÀNG MỚI ---
    const newOrderCode = Date.now();
    const order = new Order({
      userId,
      packageType,
      amount: price,
      orderCode: newOrderCode,
    });
    await order.save();
    console.log(`Tạo đơn hàng PENDING hoàn toàn mới: ${order.orderCode}`);
    // ------------------------------------

    const payosOrder = {
      amount: order.amount,
      description: description,
      orderCode: order.orderCode, // Luôn là orderCode mới
      returnUrl: `${APP_SCHEME}://upgrade-account?status=success&orderCode=${order.orderCode}`,
      cancelUrl: `${APP_SCHEME}://upgrade-account?status=cancelled&orderCode=${order.orderCode}`,
      buyerName: req.user.fullName,
      buyerEmail: req.user.email,
    };

    const paymentLinkResponse = await payOs.paymentRequests.create(payosOrder);

    res.status(200).json({
      message: "Tạo link thanh toán thành công",
      checkoutUrl: paymentLinkResponse.checkoutUrl,
    });
  } catch (error) {
    console.error("Lỗi khi tạo link thanh toán:", error);
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
  const webhookData = JSON.parse(req.body);
  try {
    console.log("--- Bắt đầu xử lý Webhook ---");
    // Khi thành công, verifiedData chính là object "data" từ webhook
    const verifiedData = await payOs.webhooks.verify(webhookData);

    // FIX: Bây giờ chúng ta kiểm tra `code` và `desc` ngay trong `verifiedData`
    if (
      verifiedData.code === "00" &&
      verifiedData.desc.toLowerCase() === "success"
    ) {
      // FIX: Truy cập orderCode trực tiếp từ verifiedData
      const orderCode = verifiedData.orderCode;
      console.log(`Webhook xác thực thành công cho đơn hàng: ${orderCode}`);

      const order = await Order.findOne({ orderCode: Number(orderCode) });

      if (!order) {
        console.error(
          `LỖI WEBHOOK: Không tìm thấy đơn hàng với orderCode ${orderCode} trong DB.`
        );
        return res
          .status(200)
          .json({ message: "Webhook received, but order not found." });
      }

      console.log(
        `Tìm thấy đơn hàng: ${order._id}, Trạng thái hiện tại: ${order.status}`
      );

      if (order.status === "PENDING") {
        order.status = "COMPLETED";
        await order.save();
        console.log(
          `ĐÃ CẬP NHẬT đơn hàng ${orderCode} sang trạng thái COMPLETED.`
        );

        const user = await User.findById(order.userId);
        if (user) {
          if (order.packageType === "VIP") {
            user.accountType = "VIP";
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            user.accountExpires = expiryDate;
          } else if (order.packageType === "SUPER") {
            user.accountType = "SUPER";
            user.accountExpires = null;
          }
          await user.save();
          console.log(
            `ĐÃ NÂNG CẤP tài khoản cho User ID: ${user._id} thành ${user.accountType}`
          );
        } else {
          console.error(
            `LỖI WEBHOOK: Không tìm thấy user với ID ${order.userId} để nâng cấp.`
          );
        }
      } else {
        console.log(
          `Bỏ qua cập nhật cho đơn hàng ${orderCode} vì trạng thái đang là '${order.status}', không phải 'PENDING'.`
        );
      }
    } else {
      console.log(
        `Bỏ qua webhook vì giao dịch không thành công. Code: ${verifiedData.code}, Desc: ${verifiedData.desc}`
      );
    }

    console.log("--- Xử lý Webhook hoàn tất ---");
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    // Lỗi này giờ đây chủ yếu sẽ là lỗi signature không hợp lệ
    console.error(
      "Lỗi nghiêm trọng khi xử lý webhook (ví dụ: sai signature):",
      error.message
    );
    return res.status(400).json({ message: "Webhook verification failed" });
  }
};

/**
 * @desc    Xử lý khi người dùng hủy đơn hàng
 * @route   POST /api/payments/cancel-order
 * @access  Private
 */
const handleCancelOrder = async (req, res) => {
  const { orderCode } = req.body;
  const userId = req.user.id;

  if (!orderCode) {
    return res.status(400).json({ message: "Thiếu mã đơn hàng." });
  }

  try {
    const order = await Order.findOne({
      orderCode: Number(orderCode),
      userId, // Đảm bảo người dùng chỉ có thể hủy đơn hàng của chính mình
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Chỉ cập nhật nếu đơn hàng đang ở trạng thái PENDING
    if (order.status === "PENDING") {
      order.status = "CANCELLED";
      await order.save();
      console.log(`Đã hủy đơn hàng: ${orderCode}`);
      return res.status(200).json({ message: "Đã hủy đơn hàng thành công." });
    } else {
      // Nếu đơn hàng đã ở trạng thái khác (COMPLETED, CANCELLED) thì không làm gì
      return res
        .status(200)
        .json({ message: `Đơn hàng đã ở trạng thái ${order.status}.` });
    }
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi hủy đơn hàng." });
  }
};

module.exports = {
  createPaymentLink,
  handlePayOsWebhook,
  handleCancelOrder, // Export hàm mới
};
