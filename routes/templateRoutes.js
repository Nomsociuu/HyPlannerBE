const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Định nghĩa ảnh mẫu cho từng template
const templateImages = {
  1: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667417/download_d10emq.jpg",
  2: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667399/ee9138c3161766d811f401484930f2ad_xdtlxv.jpg",
  3: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667393/e09aec818ca43fdcae6729bc13386fc8_kcmut6.jpg",
  4: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667375/65c724ee200078ed7875f41b74053c8d_cwrkaa.jpg",
  5: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667369/7b699032cbe8fcd3022f753e7ec28254_ghl1pu.jpg",
  6: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667363/cdc21a3396dc951c2b3b629f79020a74_yv39pm.jpg",
  7: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667357/oge_jqldjy.jpg",
  8: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667346/okkkk_ljlww6.jpg",
  9: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667322/ok_hirb90.jpg",
  10: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667316/wmremove-transformed_xylbai.jpg",
  11: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667293/chat_edit_image_20251221_054120_weioig.png",
  12: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667301/chat_edit_image_20251221_054636_dmvwkn.png",
  13: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667288/chat_edit_image_20251221_055558_nhkunh.png",
  14: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667282/chat_edit_image_20251221_055251_qxa5mo.png",
  15: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667276/wmremove-transformed_2_vw2kzx.jpg",
  16: "https://res.cloudinary.com/dqtemoeoz/image/upload/v1766667270/wmremove-transformed_3_jg6dwo.jpg",
};

// Hàm tự động đọc templates từ folder views
function getTemplatesFromViews() {
  try {
    const viewsPath = path.join(__dirname, "../views");
    const files = fs.readdirSync(viewsPath);

    // Lọc các file template-*.ejs
    const templateFiles = files.filter(
      (file) => file.startsWith("template-") && file.endsWith(".ejs")
    );

    // Tạo danh sách templates tự động
    const templates = templateFiles
      .map((file) => {
        const match = file.match(/template-(\d+)\.ejs/);
        if (!match) return null;

        const id = parseInt(match[1]);
        return {
          id,
          name: `Mẫu thiệp mời ${id}`,
          // Phân loại: số lẻ là Miễn phí, số chẵn là VIP
          type: id % 2 === 0 ? "VIP" : "Miễn phí",
          image:
            templateImages[id] ||
            "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        };
      })
      .filter((template) => template !== null)
      .sort((a, b) => a.id - b.id);

    return templates;
  } catch (error) {
    console.error("Error reading templates from views folder:", error);
    return [];
  }
}

// @desc    Lấy danh sách tất cả template (tự động từ folder views)
// @route   GET /templates
// @access  Public
router.get("/", (req, res) => {
  try {
    const templates = getTemplatesFromViews();
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Không thể tải danh sách mẫu thiệp" });
  }
});

module.exports = router;
