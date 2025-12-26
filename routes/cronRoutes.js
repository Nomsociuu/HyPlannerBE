const express = require("express");
const router = express.Router();
const {
  checkWeddingDateNotifications,
  checkTaskDeadlineNotifications,
  checkTableDeadlineNotifications,
  checkTaskReminder,
  checkBudgetReminder,
  checkCountdownReminder,
  checkInactiveReminder,
  sendRandomTip,
} = require("../controllers/notificationController");

// ✅ VERCEL CRON ENDPOINTS
// These endpoints are called by Vercel Cron Jobs (configured in vercel.json)
// They replace the node-cron schedulers which don't work on serverless

// Verify cron secret to prevent unauthorized access
const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Allow requests from Vercel Cron (no auth header) or with valid secret
  const isVercelCron = req.headers["x-vercel-cron"];
  const hasValidSecret = authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !hasValidSecret) {
    console.error("❌ Unauthorized cron request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

// Apply middleware to all routes
router.use(verifyCronSecret);

// 📅 IN-APP NOTIFICATION CRON JOBS

// Wedding date reminders - Run at 09:00 daily
router.get("/wedding-notifications", async (req, res) => {
  try {
    console.log("🔔 Running wedding notifications cron...");
    await checkWeddingDateNotifications();
    res.json({ success: true, message: "Wedding notifications sent" });
  } catch (error) {
    console.error("❌ Wedding notifications cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Task deadline reminders - Run at 08:00 and 18:00 daily
router.get("/task-notifications", async (req, res) => {
  try {
    console.log("🔔 Running task notifications cron...");
    await checkTaskDeadlineNotifications();
    res.json({ success: true, message: "Task notifications sent" });
  } catch (error) {
    console.error("❌ Task notifications cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Table deadline reminders - Run at 10:00 daily
router.get("/table-notifications", async (req, res) => {
  try {
    console.log("🔔 Running table notifications cron...");
    await checkTableDeadlineNotifications();
    res.json({ success: true, message: "Table notifications sent" });
  } catch (error) {
    console.error("❌ Table notifications cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📱 PUSH NOTIFICATION CRON JOBS

// Task reminder push - Run at 08:30 daily
router.get("/push-task-reminder", async (req, res) => {
  try {
    console.log("📱 Running task reminder push cron...");
    await checkTaskReminder();
    res.json({ success: true, message: "Task reminder push sent" });
  } catch (error) {
    console.error("❌ Task reminder push cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Budget reminder push - Run at 20:30 daily
router.get("/push-budget-reminder", async (req, res) => {
  try {
    console.log("📱 Running budget reminder push cron...");
    await checkBudgetReminder();
    res.json({ success: true, message: "Budget reminder push sent" });
  } catch (error) {
    console.error("❌ Budget reminder push cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Countdown reminder push - Run at 07:30 daily
router.get("/push-countdown", async (req, res) => {
  try {
    console.log("📱 Running countdown push cron...");
    await checkCountdownReminder();
    res.json({ success: true, message: "Countdown push sent" });
  } catch (error) {
    console.error("❌ Countdown push cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inactive user reminder push - Run at 19:00 daily
router.get("/push-inactive-reminder", async (req, res) => {
  try {
    console.log("📱 Running inactive reminder push cron...");
    await checkInactiveReminder();
    res.json({ success: true, message: "Inactive reminder push sent" });
  } catch (error) {
    console.error("❌ Inactive reminder push cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Random tip push - Run at 15:00 on Tue and Fri
router.get("/push-random-tip", async (req, res) => {
  try {
    console.log("📱 Running random tip push cron...");
    await sendRandomTip();
    res.json({ success: true, message: "Random tip push sent" });
  } catch (error) {
    console.error("❌ Random tip push cron failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔍 Health check for all cron jobs
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "All cron endpoints are available",
    endpoints: [
      "GET /api/cron/wedding-notifications",
      "GET /api/cron/task-notifications",
      "GET /api/cron/table-notifications",
      "GET /api/cron/push-task-reminder",
      "GET /api/cron/push-budget-reminder",
      "GET /api/cron/push-countdown",
      "GET /api/cron/push-inactive-reminder",
      "GET /api/cron/push-random-tip",
    ],
  });
});

module.exports = router;
