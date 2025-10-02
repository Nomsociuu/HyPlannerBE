const express = require("express");
const router = express.Router();
const InvitationLetter = require("../models/InvitationLetter");

// LƯU Ý: Đường dẫn ở đây là '/' vì tiền tố '/invitation' sẽ được định nghĩa trong server.js
// Route này sẽ xử lý các request tới: GET /invitation/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Tìm thông tin website trong database bằng slug từ URL
    const invitation = await InvitationLetter.findOne({ slug });

    // 2. Nếu không tìm thấy, render trang 404
    if (!invitation) {
      return res.status(404).render("404");
    }

    // 3. Xác định tên file template cần dùng dựa vào templateId
    const templateName = `template-${invitation.templateId}`; // Ví dụ: 'template-1'

    // 4. Render file template đó và truyền dữ liệu vào
    res.render(templateName, {
      groomName: invitation.groomName,
      brideName: invitation.brideName,
      weddingDate: invitation.weddingDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
});

module.exports = router;
