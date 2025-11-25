const express = require("express");
const router = express.Router();
const savedPostController = require("../controllers/savedPostController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Saved Post routes
router.post("/", savedPostController.savePost);
router.get("/", savedPostController.getSavedPosts);
router.get("/check/:postId", savedPostController.checkPostSaved);
router.put("/:id", savedPostController.updateSavedPost);
router.delete("/:postId", savedPostController.unsavePost);

module.exports = router;
