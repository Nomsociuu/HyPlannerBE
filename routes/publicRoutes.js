const express = require("express");
const router = express.Router();
const InvitationLetter = require("../models/InvitationLetter");

const sampleWeddingData = {
  groom: { firstName: "Chú Rể", fullName: "Nguyễn Văn Mẫu" },
  bride: { firstName: "Cô Dâu", fullName: "Trần Thị Mẫu" },
  coupleImage:
    "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3275-3124-1604978305.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=4shNiv1Inpg1OF7D3bnpwQ",
  weddingDate: "Ngày 03 Tháng 06, 2036",
  youtubeUrl: "https://www.youtube.com/watch?v=cpGxn9SmxTc", // Cần có trường này trong Schema
  loveStory: [
    {
      time: "Ngày đầu",
      title: "Gặp gỡ",
      content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
      image:
        "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3266-7581-1604978306.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=zcLhuW8yo_eVLGVjkXj5ZQ",
    },
    {
      time: "6 Tháng Sau",
      title: "Yêu nhau",
      content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
      image:
        "https://cdn.24h.com.vn/upload/2-2022/images/2022-06-09/xoainon1-1654737948-510-width660height824.jpg",
    },
  ],
  album: [
    "https://kenh14cdn.com/203336854389633024/2024/6/2/photo-7-1717318282976804803415.jpg",
    "https://s1.media.ngoisao.vn/resize_580/news/2023/02/11/xoai-non-va-xemesis-tung-bo-anh-valentine-dau-tien-ngot-nhu-mia-lui-1-ngoisaovn-w600-h901.jpeg",
    "https://media.yeah1.com/files/ngoctran/2023/05/19/347849210_1358945998287696_3397780704448075213_n-084529.jpg",
    "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/11/16/854786/8-160484653489020906.jpg",
  ],
  events: [
    {
      name: "Lễ Thành Hôn",
      time: "18:00, Ngày 03.06.2036",
    },
    {
      name: "Tiệc Cưới",
      time: "19:00, Ngày 03.06.2036",
    },
  ],
  guestbookMessages: [
    { name: "Khách mời mẫu", message: "Chúc hai bạn hạnh phúc!" },
    { name: "Khách mời 2", message: "Chúc mừng hạnh phúc!" },
    { name: "Khách mời 3", message: "Chúc hai bạn trăm năm hạnh phúc!" },
    { name: "Khách mời 4", message: "Chúc hai bạn sớm có em bé!" },
  ],
  slug: "sample-slug",
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
        fullName: invitationLetter.groomName || "Chú Rể",
        firstName: invitationLetter.groomName.split(" ")[0], // Lấy tên đầu tiên
        introduction:
          invitationLetter.groomIntroduction || "Lời chào từ chú rể", // Thêm các trường này vào Schema nếu cần
        image:
          invitationLetter.groomImage ||
          "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3188-7810-1604978305.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=gJf6UGdX4VRVgsw0dI8BTw",
      },
      bride: {
        fullName: invitationLetter.brideName || "Cô Dâu",
        firstName: invitationLetter.brideName.split(" ")[0],
        introduction:
          invitationLetter.brideIntroduction || "Lời chào từ cô dâu",
        image:
          invitationLetter.brideImage ||
          "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3194-3074-1604978305.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=jEQQl-Ao2c85BN91orNhmA",
      },
      coupleImage:
        invitationLetter.coupleImage ||
        "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3275-3124-1604978305.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=4shNiv1Inpg1OF7D3bnpwQ",
      weddingDate: invitationLetter.weddingDate || "Ngày 03 Tháng 06, 2036",
      youtubeUrl:
        invitationLetter.youtubeUrl ||
        "https://www.youtube.com/watch?v=cpGxn9SmxTc", // Cần có trường này trong Schema
      loveStory: invitationLetter.loveStory || [
        {
          time: "Ngày đầu",
          title: "Gặp gỡ",
          content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
          image:
            "https://i1-ngoisao.vnecdn.net/2020/11/10/Copy-of-IMG-3266-7581-1604978306.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=zcLhuW8yo_eVLGVjkXj5ZQ",
        },
        {
          time: "6 Tháng Sau",
          title: "Yêu nhau",
          content: "Đây là nội dung mẫu cho câu chuyện tình yêu.",
          image:
            "https://cdn.24h.com.vn/upload/2-2022/images/2022-06-09/xoainon1-1654737948-510-width660height824.jpg",
        },
      ],
      album: invitationLetter.album || [
        "https://kenh14cdn.com/203336854389633024/2024/6/2/photo-7-1717318282976804803415.jpg",
        "https://s1.media.ngoisao.vn/resize_580/news/2023/02/11/xoai-non-va-xemesis-tung-bo-anh-valentine-dau-tien-ngot-nhu-mia-lui-1-ngoisaovn-w600-h901.jpeg",
        "https://media.yeah1.com/files/ngoctran/2023/05/19/347849210_1358945998287696_3397780704448075213_n-084529.jpg",
        "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/11/16/854786/8-160484653489020906.jpg",
      ],
      events: invitationLetter.events || [
        {
          name: "Lễ Thành Hôn",
          time: "18:00, Ngày 03.06.2036",
        },
        {
          name: "Tiệc Cưới",
          time: "19:00, Ngày 03.06.2036",
        },
      ],
      guestbookMessages: invitationLetter.guestbookMessages || [
        { name: "Khách mời mẫu", message: "Chúc hai bạn hạnh phúc!" },
        { name: "Khách mời 2", message: "Chúc mừng hạnh phúc!" },
        { name: "Khách mời 3", message: "Chúc hai bạn trăm năm hạnh phúc!" },
        { name: "Khách mời 4", message: "Chúc hai bạn sớm có em bé!" },
      ],
      slug: invitationLetter.slug || "sample-slug",
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
