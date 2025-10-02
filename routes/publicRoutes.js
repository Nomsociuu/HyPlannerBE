const express = require("express");
const router = express.Router();
const InvitationLetter = require("../models/InvitationLetter");

const sampleWeddingData = {
  groom: { firstName: "Chú Rể", fullName: "Nguyễn Văn Mẫu" },
  bride: { firstName: "Cô Dâu", fullName: "Trần Thị Mẫu" },
  coupleImage:
    "https://images.unsplash.com/photo-1529340473341-a3f2cc245b0a?q=80&w=2070",
  weddingDate: "Ngày 01 Tháng 01, 2026",
  youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  loveStory: [
    {
      time: "Ngày đầu",
      title: "Gặp gỡ",
      content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
      image:
        "https://images.unsplash.com/photo-1511993221079-537a6f809c0d?q=80&w=1974",
    },
  ],
  album: [
    "https://images.unsplash.com/photo-1597158223639-9b9b5f93c72b?q=80&w=1964",
    "https://images.unsplash.com/photo-1523438882358-a61513473215?q=80&w=1974",
  ],
  events: [
    {
      name: "Tiệc Cưới",
      time: "18:00, Ngày 01.01.2026",
      venue: "Trung Tâm Hội Nghị Mẫu",
      address: "123 Đường Mẫu, TP. Mẫu",
      mapLink: "#",
    },
  ],
  guestbookMessages: [
    { name: "Khách mời mẫu", message: "Chúc hai bạn hạnh phúc!" },
  ],
};

// LƯU Ý: Đường dẫn ở đây là '/' vì tiền tố '/invitation' sẽ được định nghĩa trong server.js
// Route này sẽ xử lý các request tới: GET /invitation/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const invitationLetter = await InvitationLetter.findOne({ slug });

    if (!invitationLetter) {
      return res.status(404).render("404");
    }

    // BƯỚC 1: TÁI CẤU TRÚC DỮ LIỆU TỪ DB CHO ĐÚNG FORMAT MÀ EJS CẦN
    // Lưu ý: Các trường như `introduction`, `image` cần tồn tại trong Schema của bạn
    const weddingDataForRender = {
      groom: {
        fullName: invitationLetter.groomName,
        firstName: invitationLetter.groomName.split(" ")[0], // Lấy tên đầu tiên
        introduction: invitationLetter.groomIntroduction || "", // Thêm các trường này vào Schema nếu cần
        image:
          invitationLetter.groomImage || "https://i.pravatar.cc/300?u=groom",
      },
      bride: {
        fullName: invitationLetter.brideName,
        firstName: invitationLetter.brideName.split(" ")[0],
        introduction: invitationLetter.brideIntroduction || "",
        image:
          invitationLetter.brideImage || "https://i.pravatar.cc/300?u=bride",
      },
      coupleImage:
        invitationLetter.coupleImage ||
        "https://images.unsplash.com/photo-1529340473341-a3f2cc245b0a?q=80&w=2070",
      weddingDate: invitationLetter.weddingDate,
      youtubeUrl: invitationLetter.youtubeUrl, // Cần có trường này trong Schema
      loveStory: invitationLetter.loveStory || [], // Dùng mảng rỗng nếu không có dữ liệu
      album: invitationLetter.album || [],
      events: invitationLetter.events || [],
      guestbookMessages: invitationLetter.guestbookMessages || [],
      slug: invitationLetter.slug,
    };

    const templateName = `template-${invitationLetter.templateId}`;

    // BƯỚC 2: TRUYỀN VÀO TEMPLATE DƯỚI DẠNG OBJECT `weddingData`
    res.render(templateName, { weddingData: weddingDataForRender });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
});
// @desc    Hiển thị trang preview cho một template
// @route   GET /preview/:templateId
router.get("/preview/:templateId", (req, res) => {
  const { templateId } = req.params;
  const templateName = `template-${templateId}`;

  // Render template với dữ liệu mẫu
  res.render(templateName, { weddingData: sampleWeddingData });
});

module.exports = router;
