const InvitationLetter = require("../models/InvitationLetter");
const mixpanel = require("../service/mixpanelServer");

// Hàm helper để trích xuất src từ iframe
function extractSrcFromIframe(htmlString) {
  console.log("Extracting src from iframe HTML:", htmlString);
  if (!htmlString || typeof htmlString !== "string") {
    return "";
  }

  const srcStartIndex = htmlString.indexOf('src="');
  if (srcStartIndex === -1) {
    return "";
  }

  const openingQuoteIndex = srcStartIndex + 5;

  const closingQuoteIndex = htmlString.indexOf('"', openingQuoteIndex);
  if (closingQuoteIndex === -1) {
    return "";
  }

  const extractedUrl = htmlString.substring(
    openingQuoteIndex,
    closingQuoteIndex
  );

  return extractedUrl;
}
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

    // Track với Mixpanel
    mixpanel.track("Invitation - Created", {
      distinct_id: userId.toString(),
      invitationId: savedInvitation._id.toString(),
      templateId: templateId,
      slug: slug,
    });

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

// @desc    Cập nhật website của người dùng hiện tại
// @route   PUT /invitation/my-invitation
// @access  Private
const updateUserInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const invitation = await InvitationLetter.findOne({ userId });

    if (!invitation) {
      return res.status(404).json({ message: "Không tìm thấy website." });
    }

    const {
      groomName,
      brideName,
      weddingDate,
      aboutCouple,
      youtubeUrl,
      loveStory,
      album,
      events,
      bankAccount, // <--- events ở đây
    } = req.body;

    console.log("Received album data:", album);
    console.log("Received events data:", events);

    // Cập nhật các trường thông thường
    if (groomName) invitation.groomName = groomName;
    if (brideName) invitation.brideName = brideName;
    if (weddingDate) invitation.weddingDate = weddingDate;
    if (aboutCouple !== undefined) invitation.aboutCouple = aboutCouple;
    if (youtubeUrl !== undefined) invitation.youtubeUrl = youtubeUrl;
    if (loveStory) invitation.loveStory = loveStory; // Giả sử loveStory gửi lên đã sạch

    // Sửa lỗi: kiểm tra album là array trước khi gán
    if (album !== undefined) {
      if (Array.isArray(album)) {
        invitation.album = album;
      } else {
        console.error("Album is not an array:", album);
      }
    }

    if (bankAccount) invitation.bankAccount = bankAccount;

    // --- XỬ LÝ TRƯỜNG EVENTS ---
    if (events && Array.isArray(events)) {
      // Duyệt qua từng sự kiện gửi lên và xử lý embedMapUrl
      const processedEvents = events.map((event) => {
        // Nếu có embedMapUrl và nó là một chuỗi
        if (event && typeof event.embedMapUrl === "string") {
          // Trích xuất URL thực sự từ thẻ iframe (nếu có)
          const extractedUrl = extractSrcFromIframe(event.embedMapUrl);
          console.log("Extracted URL:", extractedUrl);
          // Trả về event mới với embedMapUrl đã được xử lý
          return { ...event, embedMapUrl: extractedUrl };
        }
        // Nếu không có embedMapUrl hoặc không phải chuỗi, giữ nguyên event
        return event;
      });
      // Gán mảng events đã xử lý vào document
      invitation.events = processedEvents;
    }
    // --- KẾT THÚC XỬ LÝ EVENTS ---

    const updatedInvitation = await invitation.save();
    res.status(200).json(updatedInvitation);
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error); // Log lỗi chi tiết hơn
    res.status(500).json({ message: "Lỗi máy chủ nội bộ khi cập nhật." });
  }
};

// @desc    Thêm một lời chúc mới vào website
// @route   POST /inviletter/:slug/add-wish
// @access  Public
const addGuestbookMessage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, message } = req.body;

    // Validation đơn giản
    if (!name || !message) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ tên và lời chúc." });
    }

    const invitation = await InvitationLetter.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: "Không tìm thấy website." });
    }

    // Thêm lời chúc mới vào mảng
    invitation.guestbookMessages.push({ name, message });

    // Sắp xếp lại để lời chúc mới nhất luôn ở trên cùng
    invitation.guestbookMessages.sort((a, b) => b.createdAt - a.createdAt);

    await invitation.save();

    res.status(201).json({
      message: "Gửi lời chúc thành công!",
      data: invitation.guestbookMessages[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// @desc    Xác nhận tham dự (RSVP)
// @route   POST /invitation/:slug/rsvp
// @access  Public
const incrementRsvpCount = async (req, res) => {
  try {
    const { slug } = req.params;
    const invitation = await InvitationLetter.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: "Không tìm thấy website." });
    }

    // Tăng trường đếm lên 1
    // Sử dụng (invitation.guestRsvpCount || 0) để an toàn nếu trường này chưa tồn tại
    invitation.guestRsvpCount = (invitation.guestRsvpCount || 0) + 1;

    await invitation.save();

    res.status(200).json({
      message: "Xác nhận tham dự thành công!",
      count: invitation.guestRsvpCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  createInvitationLetter,
  getUserInvitation,
  deleteUserInvitation,
  addGuestbookMessage,
  updateUserInvitation,
  incrementRsvpCount,
};
