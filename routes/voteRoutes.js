const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Vote routes
router.post("/", voteController.createVote);
router.get("/:targetType/:targetId/count", voteController.getVoteCount);
router.get("/:targetType/:targetId/status", voteController.getUserVoteStatus);

module.exports = router;
