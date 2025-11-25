const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Rating routes
router.post("/", ratingController.createOrUpdateRating);
router.get("/:targetType/:targetId", ratingController.getRatings);
router.get("/:targetType/:targetId/my-rating", ratingController.getMyRating);
router.delete("/:ratingId", ratingController.deleteRating);

module.exports = router;
