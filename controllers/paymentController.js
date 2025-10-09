const payOs = require("../config/payos");
const Order = require("../models/Order");
const User = require("../models/User");
const { APIError } = require("@payos/node");

const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

/**
 * @desc    Tạo link thanh toán PayOS (Logic đã cập nhật)
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
    let order;

    const existingPendingOrder = await Order.findOne({
      userId,
      status: "PENDING",
      packageType,
    });

    if (existingPendingOrder) {
      order = existingPendingOrder;
      console.log(
        `Đơn hàng PENDING đã tồn tại: ${order.orderCode}. Sẽ hủy link cũ trước khi tạo link mới.`
      );

      // --- LOGIC MỚI: HỦY LINK THANH TOÁN CŨ TRÊN PAYOS ---
      try {
        // Yêu cầu PayOS hủy phiên thanh toán cũ của orderCode này
        await payOs.paymentRequests.cancel(order.orderCode);
        console.log(
          `Hủy link thanh toán cũ cho orderCode ${order.orderCode} thành công.`
        );
      } catch (cancelError) {
        // Nếu PayOS báo lỗi "Không tìm thấy" (thường là mã 204 hoặc lỗi có code 'NOT_FOUND'),
        // nghĩa là link cũ đã hết hạn hoặc đã bị hủy. Chúng ta có thể bỏ qua lỗi này và tiếp tục.
        if (
          cancelError.code === 204 ||
          cancelError.error?.code === "NOT_FOUND"
        ) {
          console.log(`Không tìm thấy link thanh toán cũ để hủy (bỏ qua).`);
        } else {
          // Nếu là một lỗi khác, thì báo lỗi và dừng lại.
          console.error(
            "Lỗi khi hủy link thanh toán cũ trên PayOS:",
            cancelError
          );
          // Ném lỗi ra ngoài để khối catch bên ngoài bắt được
          throw new Error("Không thể hủy phiên thanh toán cũ trên PayOS.");
        }
      }
      // ----------------------------------------------------

      // Cập nhật lại số tiền nếu có thay đổi
      if (order.amount !== price) {
        order.amount = price;
        await order.save();
      }
    } else {
      const newOrderCode = Date.now();
      order = new Order({
        userId,
        packageType,
        amount: price,
        orderCode: newOrderCode,
      });
      await order.save();
      console.log(`Tạo đơn hàng PENDING mới: ${order.orderCode}`);
    }

    const payosOrder = {
      amount: order.amount,
      description: description,
      orderCode: order.orderCode,
      returnUrl: `${APP_SCHEME}://upgrade-account?status=success&orderCode=${order.orderCode}`,
      cancelUrl: `${APP_SCHEME}://upgrade-account?status=cancelled&orderCode=${order.orderCode}`,
      buyerName: req.user.fullName,
      buyerEmail: req.user.email,
    };

    // Bây giờ việc tạo link mới sẽ luôn thành công
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
  // Lưu ý: Đảm bảo bạn đã cấu hình express.raw() cho route này trong index.js
  const webhookData = JSON.parse(req.body);
  try {
    const verifiedData = await payOs.webhooks.verify(webhookData);

    if (verifiedData.code === "00" && verifiedData.desc === "Success") {
      console.log(
        `Webhook xác thực thành công cho đơn hàng: ${verifiedData.data.orderCode}`
      );
      const orderCode = verifiedData.data.orderCode;
      const order = await Order.findOne({ orderCode });

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
            user.accountExpires = null;
          }
          await user.save();
          console.log(
            `Đã nâng cấp tài khoản cho User ID: ${user._id} thành ${user.accountType}`
          );
        }
      }
    }
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Lỗi xác thực webhook:", error.message);
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
