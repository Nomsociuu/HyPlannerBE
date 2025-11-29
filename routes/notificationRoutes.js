const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Manual trigger for deadline check (can be called by cron job)
router.post("/check-deadlines", async (req, res) => {
  try {
    const result =
      await notificationController.checkTableDeadlineNotifications();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking deadlines", error: error.message });
  }
});

// Get all notifications
router.get("/:weddingEventId", notificationController.getAllNotifications);

// Get notification statistics
router.get(
  "/:weddingEventId/stats",
  notificationController.getNotificationStats
);

// Mark notification as read
router.put("/:notificationId/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/:weddingEventId/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Delete all read notifications
router.delete(
  "/:weddingEventId/delete-read",
  notificationController.deleteReadNotifications
);

module.exports = router;
