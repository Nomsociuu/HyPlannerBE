/**
 * Push Notification Scheduler
 *
 * Setup các cron jobs để gửi push notifications tự động
 * Chạy khi server start
 */

const cron = require("node-cron");
const notificationController = require("../controllers/notificationController");

/**
 * 1. Task Reminder - 08:30 hàng ngày
 * "Hỷ nhắc nhẹ nè, có vài việc nhỏ hôm nay cần dâu/rể làm đó!"
 */
cron.schedule("30 8 * * *", async () => {
  console.log("🔔 [08:30] Running: Task Reminder Push");
  try {
    const result = await notificationController.checkTaskReminder();
    console.log(`✅ Task reminders sent: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in task reminder:", error.message);
  }
});

/**
 * 2. Countdown - 07:30 hàng ngày
 * "Còn [X] ngày nữa đến ngày trọng đại rồi, dâu/rể đã sẵn sàng chưa 💛"
 */
cron.schedule("30 7 * * *", async () => {
  console.log("🔔 [07:30] Running: Countdown Push");
  try {
    const result = await notificationController.checkCountdownReminder();
    console.log(`✅ Countdown notifications sent: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in countdown:", error.message);
  }
});

/**
 * 3. Inactive User Reminder - 19:00 hàng ngày
 * "Đã vài ngày rồi, còn vài mảnh ghép nhỏ đang đợi bạn hoàn thiện đó."
 */
cron.schedule("0 19 * * *", async () => {
  console.log("🔔 [19:00] Running: Inactive User Reminder Push");
  try {
    const result = await notificationController.checkInactiveReminder();
    console.log(`✅ Inactive reminders sent: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in inactive reminder:", error.message);
  }
});

/**
 * 4. Budget Reminder - 20:30 hàng ngày
 * "Dâu/rể nhớ update lại chi tiêu để Hỷ theo dõi giúp bạn nha!"
 */
cron.schedule("30 20 * * *", async () => {
  console.log("🔔 [20:30] Running: Budget Reminder Push");
  try {
    const result = await notificationController.checkBudgetReminder();
    console.log(`✅ Budget reminders sent: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in budget reminder:", error.message);
  }
});

/**
 * 5. Random Tip - 15:00 Thứ 3 và Thứ 6
 * Messages ngẫu nhiên về moodboard, community, thiệp mời, v.v.
 */
cron.schedule("0 15 * * 2,5", async () => {
  console.log("🔔 [15:00] Running: Random Tip Push (Tuesday/Friday)");
  try {
    const result = await notificationController.sendRandomTip();
    console.log(`✅ Random tips sent: ${result.count}`);
  } catch (error) {
    console.error("❌ Error in random tip:", error.message);
  }
});

console.log("✅ Push Notification Scheduler initialized:");
console.log("   - 07:30: Countdown (daily)");
console.log("   - 08:30: Task Reminder (daily)");
console.log("   - 15:00: Random Tip (Tue, Fri)");
console.log("   - 19:00: Inactive Reminder (daily)");
console.log("   - 20:30: Budget Reminder (daily)");
