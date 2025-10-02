const InvitationLetter = require("../models/InvitationLetter");

// @desc    Tạo một thiệp mời đám cưới mới
// @route   POST /invitation/invitation-letters
// @access  Private (cần đăng nhập)
const createInvitationLetter = async (req, res) => {
  try {
    // Lấy dữ liệu từ body của request mà frontend gửi lên
    const { templateId, groomName, brideName, weddingDate, slug } = req.body;

    // Lấy userId từ middleware 'protect' đã xử lý trước đó
    const userId = req.user.id; // Giả sử payload của JWT có trường 'id'

    // --- Validation ---
    if (!templateId || !groomName || !brideName || !weddingDate || !slug) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // 1. Kiểm tra xem slug đã tồn tại chưa
    const existingSlug = await InvitationLetter.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        message:
          "Địa chỉ website này đã được sử dụng. Vui lòng chọn địa chỉ khác.",
      });
    }

    // 2. (Tùy chọn) Kiểm tra xem user này đã tạo website nào chưa
    // const existingWeddingForUser = await Wedding.findOne({ userId });
    // if (existingWeddingForUser) {
    //   return res.status(400).json({ message: 'Mỗi tài khoản chỉ được tạo một website.' });
    // }

    // Tạo một đối tượng InvitationLetter mới
    const invitation = new InvitationLetter({
      userId,
      templateId,
      groomName,
      brideName,
      weddingDate,
      slug,
    });

    // Lưu vào database
    const savedInvitation = await invitation.save();

    // Tạo URL đầy đủ để trả về cho client
    const fullUrl = `${req.protocol}://${req.get("host")}/invitation/${
      savedInvitation.slug
    }`;

    // Trả về response thành công
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

module.exports = {
  createInvitationLetter,
};
