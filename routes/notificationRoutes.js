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

// Manual trigger for wedding date notifications
router.post("/check-wedding-dates", async (req, res) => {
  try {
    const result = await notificationController.checkWeddingDateNotifications();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking wedding dates", error: error.message });
  }
});

// Manual trigger for task deadline notifications
router.post("/check-task-deadlines", async (req, res) => {
  try {
    const result =
      await notificationController.checkTaskDeadlineNotifications();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking task deadlines", error: error.message });
  }
});

// ============================================================
// PUSH NOTIFICATION TRIGGERS (OUT-APP)
// ============================================================

// Trigger: Task Reminder (08:30 daily)
router.post("/push/task-reminder", async (req, res) => {
  try {
    const result = await notificationController.checkTaskReminder();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending task reminder", error: error.message });
  }
});

// Trigger: Budget Reminder (20:30 daily)
router.post("/push/budget-reminder", async (req, res) => {
  try {
    const result = await notificationController.checkBudgetReminder();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending budget reminder", error: error.message });
  }
});

// Trigger: Countdown Reminder (07:30 daily)
router.post("/push/countdown", async (req, res) => {
  try {
    const result = await notificationController.checkCountdownReminder();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending countdown", error: error.message });
  }
});

// Trigger: Inactive User Reminder (19:00 daily)
router.post("/push/inactive-reminder", async (req, res) => {
  try {
    const result = await notificationController.checkInactiveReminder();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error sending inactive reminder",
      error: error.message,
    });
  }
});

// Trigger: Random Tip (flexible timing)
router.post("/push/random-tip", async (req, res) => {
  try {
    const result = await notificationController.sendRandomTip();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending random tip", error: error.message });
  }
});

// ============================================================
// BROADCAST NOTIFICATION (Admin/Testing)
// ============================================================

// Broadcast notification to ALL users
router.post("/broadcast", async (req, res) => {
  try {
    const { title, message, data, priority, type } = req.body;

    const result = await notificationController.sendBroadcastNotification({
      title,
      message,
      data,
      priority,
      type,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error sending broadcast notification",
      error: error.message,
    });
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
