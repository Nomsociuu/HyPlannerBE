const InvitationLetter = require("../models/InvitationLetter");

// @desc    Tạo một thiệp mời đám cưới mới
// @route   POST /invitation/invitation-letters
// @access  Private (cần đăng nhập)
const createInvitationLetter = async (req, res) => {
  try {
    const { templateId, groomName, brideName, weddingDate, slug } = req.body;
    const userId = req.user.id;

    // --- Validation ---
    if (!templateId || !groomName || !brideName || !weddingDate || !slug) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // ----- BẮT ĐẦU PHẦN CẬP NHẬT -----
    // BƯỚC 1: KIỂM TRA XEM NGƯỜI DÙNG ĐÃ CÓ WEBSITE NÀO CHƯA
    const existingInvitationForUser = await InvitationLetter.findOne({
      userId,
    });

    if (existingInvitationForUser) {
      // Nếu đã tồn tại, trả về lỗi 409 Conflict
      return res.status(409).json({
        message:
          "Mỗi tài khoản chỉ được tạo một website. Vui lòng xóa website cũ trước khi tạo mới.",
      });
    }
    // ----- KẾT THÚC PHẦN CẬP NHẬT -----

    // BƯỚC 2: KIỂM TRA SLUG (giữ nguyên như cũ)
    const existingSlug = await InvitationLetter.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        message:
          "Địa chỉ website này đã được sử dụng. Vui lòng chọn địa chỉ khác.",
      });
    }

    // Nếu tất cả kiểm tra đều qua, tiến hành tạo mới
    const invitation = new InvitationLetter({
      userId,
      templateId,
      groomName,
      brideName,
      weddingDate,
      slug,
    });

    const savedInvitation = await invitation.save();

    const fullUrl = `${req.protocol}://${req.get("host")}/inviletter/${
      savedInvitation.slug
    }`;

    res.status(201).json({
      message: "Tạo website thành công!",
      url: fullUrl,
      data: savedInvitation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// @desc    Lấy thông tin website của người dùng hiện tại
// @route   GET /invitation/my-invitation
// @access  Private
const getUserInvitation = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware 'protect'
    const invitation = await InvitationLetter.findOne({ userId });

    // Nếu không tìm thấy, trả về null. Frontend sẽ biết là user chưa tạo.
    if (!invitation) {
      return res.status(200).json(null);
    }

    // Nếu tìm thấy, trả về dữ liệu
    res.status(200).json(invitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// @desc    Xóa website của người dùng hiện tại
// @route   DELETE /invitation/my-invitation
// @access  Private
const deleteUserInvitation = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm và xóa website dựa trên userId
    const deletedInvitation = await InvitationLetter.findOneAndDelete({
      userId,
    });

    // Nếu không có gì để xóa, báo lỗi 404 Not Found
    if (!deletedInvitation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy website để xóa." });
    }

    // Trả về thông báo thành công
    res.status(200).json({ message: "Đã xóa website thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  createInvitationLetter,
  getUserInvitation,
  deleteUserInvitation,
};
