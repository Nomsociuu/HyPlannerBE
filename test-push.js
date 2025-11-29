/**
 * Test Script for Push Notifications
 *
 * This script helps you test push notifications without waiting for real events
 * Run in Node.js backend environment
 */

require("dotenv").config();
const mongoose = require("mongoose");
const notificationController = require("./controllers/notificationController");
const User = require("./models/User");
const WeddingEvent = require("./models/WeddingEvent");
const Guest = require("./models/Guest");

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

/**
 * Test 1: Send RSVP notification manually
 */
async function testRSVPNotification() {
  console.log("\n🧪 TEST 1: RSVP Notification");
  console.log("================================");

  try {
    // Find a user with push token
    const user = await User.findOne({ pushToken: { $ne: null } });
    if (!user) {
      console.log(
        "❌ No user with push token found. Login on mobile app first."
      );
      return;
    }

    // Find or create a wedding event
    let weddingEvent = await WeddingEvent.findOne({ creatorId: user._id });
    if (!weddingEvent) {
      console.log("❌ No wedding event found for this user");
      return;
    }

    console.log("✅ Found user:", user.email);
    console.log("✅ Found wedding event:", weddingEvent._id);

    // Create test notification
    const notification = await notificationController.createNotification({
      userId: user._id,
      weddingEventId: weddingEvent._id,
      type: "guest_confirmed",
      title: "🎉 [TEST] Khách mời xác nhận tham dự!",
      message:
        "Nguyễn Văn A đã xác nhận sẽ tham dự đám cưới của bạn qua thiệp mời online.",
      data: {
        guestName: "Nguyễn Văn A",
        guestEmail: "test@example.com",
        newStatus: "confirmed",
      },
      priority: "high",
    });

    console.log("✅ Notification created:", notification._id);
    console.log("📱 Push notification should be sent to:", user.email);
    console.log("\n👉 Check your phone for the notification!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Test 2: Test table deadline notifications
 */
async function testDeadlineNotification() {
  console.log("\n🧪 TEST 2: Table Deadline Notification");
  console.log("================================");

  try {
    const result =
      await notificationController.checkTableDeadlineNotifications();
    console.log("✅ Result:", result);
    console.log("\n👉 Check your phone for notifications!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Test 3: Create test wedding event 3 days from now
 */
async function createTestWeddingEvent() {
  console.log("\n🧪 TEST 3: Create Test Wedding Event");
  console.log("================================");

  try {
    const user = await User.findOne({ pushToken: { $ne: null } });
    if (!user) {
      console.log("❌ No user with push token found");
      return;
    }

    // Create wedding event 3 days from now
    const weddingDate = new Date();
    weddingDate.setDate(weddingDate.getDate() + 3);
    weddingDate.setHours(18, 0, 0, 0); // 6:00 PM

    const weddingEvent = new WeddingEvent({
      creatorId: user._id,
      groomName: "Nguyễn Văn A",
      brideName: "Trần Thị B",
      weddingDate: weddingDate,
      venue: "Nhà hàng ABC",
      address: "123 Đường XYZ, TP.HCM",
    });

    await weddingEvent.save();

    console.log("✅ Test wedding event created:");
    console.log("  - Event ID:", weddingEvent._id);
    console.log("  - Wedding Date:", weddingDate.toLocaleString("vi-VN"));
    console.log("  - Days from now: 3");
    console.log(
      "\n👉 Cron job will send notification tomorrow at 9:00 AM (if today < wedding date - 3 days)"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Test 4: Add test guests to wedding
 */
async function addTestGuests() {
  console.log("\n🧪 TEST 4: Add Test Guests");
  console.log("================================");

  try {
    const user = await User.findOne({ pushToken: { $ne: null } });
    const weddingEvent = await WeddingEvent.findOne({ creatorId: user._id });

    if (!user || !weddingEvent) {
      console.log("❌ User or wedding event not found");
      return;
    }

    // Create test guests
    const testGuests = [
      {
        weddingEventId: weddingEvent._id,
        name: "Nguyễn Văn A",
        email: "guest1@example.com",
        group: "groom",
        attendanceStatus: "confirmed",
      },
      {
        weddingEventId: weddingEvent._id,
        name: "Trần Thị B",
        email: "guest2@example.com",
        group: "bride",
        attendanceStatus: "pending",
      },
      {
        weddingEventId: weddingEvent._id,
        name: "Lê Văn C",
        email: "guest3@example.com",
        group: "both",
        attendanceStatus: "no_response",
      },
    ];

    const guests = await Guest.insertMany(testGuests);

    console.log("✅ Created", guests.length, "test guests");
    console.log("  - 1 confirmed");
    console.log("  - 1 pending");
    console.log("  - 1 no response");
    console.log("\n👉 These will be counted in deadline notifications");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Test 5: Check user's push token
 */
async function checkPushToken() {
  console.log("\n🧪 TEST 5: Check Push Tokens");
  console.log("================================");

  try {
    const usersWithToken = await User.find({
      pushToken: { $ne: null },
    }).select("email pushToken pushTokenUpdatedAt");

    if (usersWithToken.length === 0) {
      console.log("❌ No users with push token found");
      console.log("\n👉 Login on mobile app to register push token");
      return;
    }

    console.log(`✅ Found ${usersWithToken.length} user(s) with push token:\n`);

    usersWithToken.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Token: ${user.pushToken.substring(0, 30)}...`);
      console.log(
        `   Updated: ${
          user.pushTokenUpdatedAt?.toLocaleString("vi-VN") || "N/A"
        }`
      );
      console.log();
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Main menu
 */
async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║     🔔 PUSH NOTIFICATION TEST SUITE                  ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("\n");

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "rsvp":
      await testRSVPNotification();
      break;
    case "deadline":
      await testDeadlineNotification();
      break;
    case "create-event":
      await createTestWeddingEvent();
      break;
    case "add-guests":
      await addTestGuests();
      break;
    case "check-token":
      await checkPushToken();
      break;
    case "all":
      await checkPushToken();
      await createTestWeddingEvent();
      await addTestGuests();
      await testDeadlineNotification();
      break;
    default:
      console.log("Available commands:");
      console.log("");
      console.log(
        "  node test-push.js rsvp           - Test RSVP notification"
      );
      console.log(
        "  node test-push.js deadline       - Test deadline notification"
      );
      console.log(
        "  node test-push.js create-event   - Create test wedding event"
      );
      console.log("  node test-push.js add-guests     - Add test guests");
      console.log("  node test-push.js check-token    - Check push tokens");
      console.log("  node test-push.js all            - Run all tests");
      console.log("");
      console.log("Example:");
      console.log("  node test-push.js rsvp");
      console.log("");
  }

  // Close connection
  await mongoose.connection.close();
  console.log("\n✅ Done!");
  process.exit(0);
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
