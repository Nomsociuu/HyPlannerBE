const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Định nghĩa ảnh mẫu cho từng template
const templateImages = {
  1: "https://images.pexels.com/photos/1801263/pexels-photo-1801263.jpeg?_gl=1*set4wg*_ga*NTA0MTc2NDYuMTc1OTQzNzY2MQ..*_ga_8JE65Q40S6*czE3NTk0Mzc2NjAkbzEkZzEkdDE3NTk0Mzc2NjckajUzJGwwJGgw",
  2: "https://images.pexels.com/photos/2219276/pexels-photo-2219276.jpeg?_gl=1*1jvtq01*_ga*NTA0MTc2NDYuMTc1OTQzNzY2MQ..*_ga_8JE65Q40S6*czE3NTk0Mzc2NjAkbzEkZzEkdDE3NTk0Mzc3MjckajU5JGwwJGgw",
  3: "https://as1.ftcdn.net/v2/jpg/01/75/22/66/1000_F_175226614_P4iBRGUzBPXoXR7x1AnMqXqp2gUL0tJG.jpg",
  4: "https://assets.minted.com/image/upload/v1735792462/Minted_Onsite_Assets/2025/SEO%20Content%20Articles/wedding-processional-01.jpg",
  5: "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  6: "https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  7: "https://images.pexels.com/photos/2291593/pexels-photo-2291593.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  8: "https://images.pexels.com/photos/3779693/pexels-photo-3779693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  9: "https://images.pexels.com/photos/4114755/pexels-photo-4114755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  10: "https://images.pexels.com/photos/157757/weddings-planners-places-location-157757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  11: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  12: "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
