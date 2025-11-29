const Notification = require("../models/Notification");
const WeddingEvent = require("../models/WeddingEvent");
const Guest = require("../models/Guest");
const User = require("../models/User");
const mixpanel = require("../service/mixpanelServer");
const { Expo } = require("expo-server-sdk");

// Initialize Expo SDK
const expo = new Expo();

// Helper function to send push notification
async function sendPushNotification(userId, title, message, data = {}) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushToken) {
      console.log(`No push token for user ${userId}`);
      return;
    }

    const pushToken = user.pushToken;

    // Check if token is valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Invalid Expo push token: ${pushToken}`);
      return;
    }

    // Prepare push notification message
    const messages = [
      {
        to: pushToken,
        sound: "default",
        title,
        body: message,
        data,
        priority: "high",
        channelId: "default",
      },
    ];

    // Send push notification
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }

    console.log("Push notification sent:", tickets);
    return tickets;
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
  }
}

// Helper function to create notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Send push notification to user
    if (notificationData.userId) {
      await sendPushNotification(
        notificationData.userId,
        notificationData.title,
        notificationData.message,
        notificationData.data || {}
      );
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Helper function to check table deadline and create notification
// This should be called periodically (e.g., daily cron job)
exports.checkTableDeadlineNotifications = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find wedding events happening soon
    const upcomingEvents = await WeddingEvent.find({
      weddingDate: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    });

    for (const event of upcomingEvents) {
      const daysDiff = Math.ceil(
        (new Date(event.weddingDate) - now) / (1000 * 60 * 60 * 24)
      );

      // Get pending guests count
      const pendingGuests = await Guest.countDocuments({
        weddingEventId: event._id,
        isActive: true,
        attendanceStatus: { $in: ["pending", "no_response"] },
      });

      // Get guests without table assignment
      const guestsWithoutTable = await Guest.countDocuments({
        weddingEventId: event._id,
        isActive: true,
        attendanceStatus: "confirmed",
        $or: [{ tableNumber: { $exists: false } }, { tableNumber: null }],
      });

      // Create notifications based on deadline proximity
      let shouldNotify = false;
      let priority = "medium";
      let title = "";
      let message = "";

      if (daysDiff <= 3) {
        shouldNotify = true;
        priority = "high";
        title = "⚠️ Gấp! Còn " + daysDiff + " ngày đến đám cưới";
        message = `Còn ${pendingGuests} khách chưa phản hồi và ${guestsWithoutTable} khách chưa được sắp xếp bàn. Hãy hoàn thiện ngay!`;
      } else if (daysDiff <= 7) {
        shouldNotify = true;
        priority = "medium";
        title = "📋 Nhắc nhở: Còn " + daysDiff + " ngày đến đám cưới";
        message = `Bạn có ${pendingGuests} khách chưa phản hồi và ${guestsWithoutTable} khách chưa được sắp xếp bàn.`;
      }

      if (shouldNotify && (pendingGuests > 0 || guestsWithoutTable > 0)) {
        // Check if similar notification was sent today
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const existingNotif = await Notification.findOne({
          userId: event.creatorId,
          weddingEventId: event._id,
          type: "table_deadline",
          createdAt: { $gte: todayStart },
        });

        if (!existingNotif) {
          await exports.createNotification({
            userId: event.creatorId,
            weddingEventId: event._id,
            type: "table_deadline",
            title,
            message,
            data: {
              daysRemaining: daysDiff,
            },
            priority,
          });
        }
      }
    }

    return { message: "Table deadline check completed" };
  } catch (error) {
    console.error("Error checking table deadlines:", error);
    throw error;
  }
};

// Get all notifications for user's wedding event
// GET /notifications/:weddingEventId
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;
    const { isRead, limit = 50, skip = 0 } = req.query;

    // Verify wedding event belongs to user
    const weddingEvent = await WeddingEvent.findOne({
      _id: weddingEventId,
      creatorId: userId,
    });

    if (!weddingEvent) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện cưới",
      });
    }

    // Build query
    const query = {
      userId,
      weddingEventId,
    };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("data.guestId", "name email phoneNumber")
      .lean();

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId,
      weddingEventId,
      isRead: false,
    });

    res.status(200).json({
      notifications,
      totalCount,
      unreadCount,
      hasMore: totalCount > parseInt(skip) + notifications.length,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Mark notification as read
// PUT /notifications/:notificationId/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId,
      },
      {
        $set: { isRead: true },
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Không tìm thấy thông báo",
      });
    }

    res.status(200).json({
      message: "Đã đánh dấu đã đọc",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Mark all notifications as read
// PUT /notifications/:weddingEventId/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    const result = await Notification.updateMany(
      {
        userId,
        weddingEventId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    mixpanel.track("Notifications - Mark All As Read", {
      distinct_id: userId.toString(),
      weddingEventId,
      count: result.modifiedCount,
    });

    res.status(200).json({
      message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Delete notification
// DELETE /notifications/:notificationId
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Không tìm thấy thông báo",
      });
    }

    res.status(200).json({
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Delete all read notifications
// DELETE /notifications/:weddingEventId/delete-read
exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    const result = await Notification.deleteMany({
      userId,
      weddingEventId,
      isRead: true,
    });

    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} thông báo đã đọc`,
      count: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Get notification statistics
// GET /notifications/:weddingEventId/stats
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weddingEventId } = req.params;

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: userId,
          weddingEventId: weddingEventId,
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
        },
      },
    ]);

    const totalUnread = await Notification.countDocuments({
      userId,
      weddingEventId,
      isRead: false,
    });

    res.status(200).json({
      stats,
      totalUnread,
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};
