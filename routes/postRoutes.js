const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Post CRUD routes
router.post("/create", postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.get("/user/:userId", postController.getPostsByUser);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

// Reaction routes
router.post("/:id/react", postController.reactToPost);
router.delete("/:id/react", postController.unreactToPost);

module.exports = router;
