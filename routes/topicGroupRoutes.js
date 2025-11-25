const express = require("express");
const router = express.Router();
const topicGroupController = require("../controllers/topicGroupController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Topic Group CRUD routes
router.post("/", topicGroupController.createTopicGroup);
router.get("/", topicGroupController.getAllTopicGroups);
router.get("/my-groups", topicGroupController.getMyTopicGroups);
router.get("/:id", topicGroupController.getTopicGroupById);
router.put("/:id", topicGroupController.updateTopicGroup);
router.delete("/:id", topicGroupController.deleteTopicGroup);

// Member management routes
router.post("/:id/join", topicGroupController.joinTopicGroup);
router.post("/:id/leave", topicGroupController.leaveTopicGroup);

// Posts in group
router.get("/:id/posts", topicGroupController.getTopicGroupPosts);

module.exports = router;
