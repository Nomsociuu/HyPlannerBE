const express = require("express");
const router = express.Router();

// Thay vì hard-code ở frontend, chúng ta sẽ quản lý danh sách template ở backend
// Sau này bạn có thể lấy danh sách này từ database
const templates = [
  {
    id: 1,
    name: "Classic Elegance",
    type: "VIP",
    image:
      "https://images.pexels.com/photos/1801263/pexels-photo-1801263.jpeg?_gl=1*set4wg*_ga*NTA0MTc2NDYuMTc1OTQzNzY2MQ..*_ga_8JE65Q40S6*czE3NTk0Mzc2NjAkbzEkZzEkdDE3NTk0Mzc2NjckajUzJGwwJGgw",
  },
  {
    id: 2,
    name: "Rustic Charm",
    type: "Miễn phí",
    image:
      "https://images.pexels.com/photos/2219276/pexels-photo-2219276.jpeg?_gl=1*1jvtq01*_ga*NTA0MTc2NDYuMTc1OTQzNzY2MQ..*_ga_8JE65Q40S6*czE3NTk0Mzc2NjAkbzEkZzEkdDE3NTk0Mzc3MjckajU5JGwwJGgw",
  },
  {
    id: 3,
    name: "Modern Minimal",
    type: "Miễn phí",
    image:
      "https://as1.ftcdn.net/v2/jpg/01/75/22/66/1000_F_175226614_P4iBRGUzBPXoXR7x1AnMqXqp2gUL0tJG.jpg",
  },
  {
    id: 4,
    name: "Romantic Dream",
    type: "VIP",
    image:
      "https://assets.minted.com/image/upload/v1735792462/Minted_Onsite_Assets/2025/SEO%20Content%20Articles/wedding-processional-01.jpg",
  },
];

// @desc    Lấy danh sách tất cả template
// @route   GET /templates
// @access  Public
router.get("/", (req, res) => {
  res.json(templates);
});

module.exports = router;
