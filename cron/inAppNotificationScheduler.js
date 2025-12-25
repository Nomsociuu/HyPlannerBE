/**
 * In-App Notification Scheduler
 *
 * Setup các cron jobs để check và tạo in-app notifications
 * Các notifications này KHÔNG gửi push, chỉ hiển thị trong app
 */

const cron = require("node-cron");
const notificationController = require("../controllers/notificationController");

/**
 * 1. Wedding Date Approaching - 09:00 hàng ngày
 * Check các wedding dates còn 30, 14, 7, 3, 1 ngày
 */
cron.schedule("0 9 * * *", async () => {
  console.log("📅 [09:00] Running: Wedding Date Check");
  try {
    const result = await notificationController.checkWeddingDateNotifications();
    console.log(`✅ Wedding date notifications created: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in wedding date check:", error.message);
  }
});

/**
 * 2. Task Deadlines - 08:00 và 18:00 hàng ngày
 * Check tasks còn 3, 1 ngày hoặc đã quá hạn
 */
cron.schedule("0 8,18 * * *", async () => {
  const hour = new Date().getHours();
  console.log(`⏰ [${hour}:00] Running: Task Deadline Check`);
  try {
    const result =
      await notificationController.checkTaskDeadlineNotifications();
    console.log(`✅ Task deadline notifications created: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in task deadline check:", error.message);
  }
});

/**
 * 3. Table Deadlines - 10:00 hàng ngày
 * Check guests chưa confirm còn 3, 2, 1 ngày trước wedding
 */
cron.schedule("0 10 * * *", async () => {
  console.log("👥 [10:00] Running: Table Deadline Check");
  try {
    const result =
      await notificationController.checkTableDeadlineNotifications();
    console.log(
      `✅ Table deadline check completed for ${result.eventsChecked} events`
    );
  } catch (error) {
    console.error("❌ Error in table deadline check:", error.message);
  }
});

console.log("✅ In-App Notification Scheduler initialized:");
console.log("   - 08:00, 18:00: Task Deadlines (daily)");
console.log("   - 09:00: Wedding Dates (daily)");
console.log("   - 10:00: Table Deadlines (daily)");
