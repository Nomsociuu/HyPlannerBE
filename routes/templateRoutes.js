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
      "https://images.unsplash.com/photo-1597158223639-9b9b5f93c72b?q=80&w=1964",
  },
  {
    id: 2,
    name: "Rustic Charm",
    type: "Miễn phí",
    image:
      "https://images.unsplash.com/photo-1523438882358-a61513473215?q=80&w=1974",
  },
  {
    id: 3,
    name: "Modern Minimal",
    type: "Miễn phí",
    image:
      "https://images.unsplash.com/photo-1606595861444-700898528a49?q=80&w=1974",
  },
  {
    id: 4,
    name: "Romantic Dream",
    type: "VIP",
    image:
      "https://images.unsplash.com/photo-1595393566105-a50d27809228?q=80&w=1974",
  },
];

// @desc    Lấy danh sách tất cả template
// @route   GET /templates
// @access  Public
router.get("/", (req, res) => {
  res.json(templates);
});

module.exports = router;
