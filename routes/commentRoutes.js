const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Comment CRUD routes
router.post("/create", commentController.createComment);
router.get("/post/:postId", commentController.getCommentsByPost);
router.get("/:commentId/replies", commentController.getRepliesByComment);
router.put("/:id", commentController.updateComment);
router.delete("/:id", commentController.deleteComment);

// Reaction routes
router.post("/:id/react", commentController.reactToComment);
router.delete("/:id/react", commentController.unreactToComment);

module.exports = router;
