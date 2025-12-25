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

    // KHÔNG tự động gửi push cho in-app notifications
    // Push chỉ gửi cho các scheduled push notification types

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Helper function to create PUSH notification (out-app)
exports.createPushNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // GỬI PUSH cho out-app notifications
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
    console.error("Error creating push notification:", error);
    throw error;
  }
};

// Helper function to check table deadline and create notification
// This should be called periodically (e.g., daily cron job)
exports.checkTableDeadlineNotifications = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Calculate deadline dates
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Find wedding events happening in exactly 3, 2, or 1 day
    const upcomingEvents = await WeddingEvent.find({
      weddingDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    for (const event of upcomingEvents) {
      const weddingDate = new Date(event.weddingDate);
      weddingDate.setHours(0, 0, 0, 0);

      const daysUntilWedding = Math.ceil(
        (weddingDate - now) / (1000 * 60 * 60 * 24)
      );

      // Only send notification if exactly 3, 2, or 1 day before wedding
      if (![1, 2, 3].includes(daysUntilWedding)) {
        continue;
      }

      // Check if notification already sent for this day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingNotification = await Notification.findOne({
        userId: event.creatorId,
        weddingEventId: event._id,
        type: "table_deadline",
        "data.daysRemaining": daysUntilWedding,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (existingNotification) {
        console.log(
          `Notification already sent for event ${event._id} - ${daysUntilWedding} days remaining`
        );
        continue;
      }

      // Get guest statistics
      const totalGuests = await Guest.countDocuments({
        weddingEventId: event._id,
      });
      const confirmedGuests = await Guest.countDocuments({
        weddingEventId: event._id,
        attendanceStatus: "confirmed",
      });
      const pendingGuests = await Guest.countDocuments({
        weddingEventId: event._id,
        attendanceStatus: { $in: ["pending", "no_response"] },
      });

      // Determine message based on days remaining
      let title, message;
      if (daysUntilWedding === 3) {
        title = "⏰ Còn 3 ngày đến ngày cưới!";
        message = `Hãy kiểm tra và chốt số lượng bàn tiệc. Hiện có ${confirmedGuests}/${totalGuests} khách đã xác nhận, ${pendingGuests} khách chưa phản hồi.`;
      } else if (daysUntilWedding === 2) {
        title = "⚠️ Còn 2 ngày đến ngày cưới!";
        message = `Đến lúc chốt số bàn rồi! ${confirmedGuests}/${totalGuests} khách đã xác nhận. Hãy liên hệ nhà hàng ngay.`;
      } else if (daysUntilWedding === 1) {
        title = "🚨 Ngày mai là ngày cưới!";
        message = `Kiểm tra lại danh sách khách mời lần cuối. ${confirmedGuests} khách đã xác nhận tham dự.`;
      }

      // Create and send notification
      await exports.createNotification({
        userId: event.creatorId,
        weddingEventId: event._id,
        type: "table_deadline",
        title,
        message,
        data: {
          daysRemaining: daysUntilWedding,
          totalGuests,
          confirmedGuests,
          pendingGuests,
          weddingDate: event.weddingDate,
        },
        priority: daysUntilWedding === 1 ? "high" : "medium",
      });

      console.log(
        `Table deadline notification sent for event ${event._id} - ${daysUntilWedding} days remaining`
      );
    }

    return { success: true, eventsChecked: upcomingEvents.length };
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
// Check wedding date approaching and create notifications
// This should be called daily by a cron job
exports.checkWeddingDateNotifications = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find all upcoming wedding events
    const upcomingEvents = await WeddingEvent.find({
      timeToMarried: {
        $gte: now,
        $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
      },
    });

    const notificationDays = [30, 14, 7, 3, 1]; // Days to send notifications

    for (const event of upcomingEvents) {
      const daysUntilWedding = Math.ceil(
        (new Date(event.timeToMarried) - now) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send notification for this day
      if (notificationDays.includes(daysUntilWedding)) {
        // Send to all members
        for (const memberId of event.member) {
          try {
            // Check if notification already sent today
            const existingNotification = await Notification.findOne({
              userId: memberId,
              weddingEventId: event._id,
              type: "wedding_date_approaching",
              "data.daysRemaining": daysUntilWedding,
              createdAt: {
                $gte: now,
                $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
              },
            });

            if (!existingNotification) {
              let emoji = "📅";
              let priority = "medium";

              if (daysUntilWedding <= 3) {
                emoji = "🎉";
                priority = "high";
              }

              await exports.createNotification({
                userId: memberId,
                weddingEventId: event._id,
                type: "wedding_date_approaching",
                title: `${emoji} Còn ${daysUntilWedding} ngày nữa là đến ngày cưới!`,
                message: `Hôn lễ của ${event.brideName} và ${event.groomName} sẽ diễn ra trong ${daysUntilWedding} ngày nữa. Hãy chuẩn bị thật chu đáo nhé!`,
                data: {
                  daysRemaining: daysUntilWedding,
                },
                priority,
              });
            }
          } catch (error) {
            console.error("Error creating wedding date notification:", error);
          }
        }
      }
    }

    return {
      message: "Wedding date notifications checked",
      count: upcomingEvents.length,
    };
  } catch (error) {
    console.error("Error in checkWeddingDateNotifications:", error);
    throw error;
  }
};

// Check task deadlines and create notifications
exports.checkTaskDeadlineNotifications = async () => {
  try {
    const Task = require("../models/Task");
    const Phase = require("../models/Phase");
    const now = new Date();

    // Find all incomplete tasks with their phases
    const phases = await Phase.find({
      phaseTimeEnd: { $exists: true },
    });

    let notificationsSent = 0;

    for (const phase of phases) {
      const phaseEndDate = new Date(phase.phaseTimeEnd);
      const daysUntilDeadline = Math.ceil(
        (phaseEndDate - now) / (1000 * 60 * 60 * 24)
      );

      // Only check 3 days before, 1 day before, or overdue tasks
      if (![3, 1].includes(daysUntilDeadline) && daysUntilDeadline >= 0) {
        continue;
      }

      // Find incomplete tasks in this phase
      const tasks = await Task.find({
        _id: { $in: phase.tasks },
        completed: false,
      });

      // Find wedding event containing this phase
      const weddingEvent = await WeddingEvent.findOne({
        phases: phase._id,
      });

      if (!weddingEvent) continue;

      for (const task of tasks) {
        if (!task.member || task.member.length === 0) continue;

        for (const memberId of task.member) {
          try {
            // Check if notification already sent today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const existingNotification = await Notification.findOne({
              userId: memberId,
              weddingEventId: weddingEvent._id,
              type:
                daysUntilDeadline < 0
                  ? "task_overdue"
                  : "task_deadline_approaching",
              "data.taskId": task._id,
              createdAt: {
                $gte: today,
                $lt: tomorrow,
              },
            });

            if (!existingNotification) {
              const notificationType =
                daysUntilDeadline < 0
                  ? "task_overdue"
                  : "task_deadline_approaching";
              const title =
                daysUntilDeadline < 0
                  ? `⚠️ Công việc đã quá hạn!`
                  : `⏰ Công việc sắp đến hạn!`;
              const message =
                daysUntilDeadline < 0
                  ? `Công việc "${task.taskName}" đã quá hạn ${Math.abs(
                      daysUntilDeadline
                    )} ngày. Hãy hoàn thành ngay!`
                  : `Còn ${daysUntilDeadline} ngày để hoàn thành công việc "${task.taskName}". Hãy nhanh tay nhé!`;

              await exports.createNotification({
                userId: memberId,
                weddingEventId: weddingEvent._id,
                type: notificationType,
                title: title,
                message: message,
                data: {
                  taskId: task._id,
                  taskName: task.taskName,
                  phaseId: phase._id,
                  phaseName: phase.phaseName,
                  daysRemaining: daysUntilDeadline,
                },
                priority: daysUntilDeadline <= 1 ? "high" : "medium",
              });

              notificationsSent++;
            }
          } catch (error) {
            console.error("Error creating task deadline notification:", error);
          }
        }
      }
    }

    return {
      message: "Task deadline notifications checked",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in checkTaskDeadlineNotifications:", error);
    throw error;
  }
};

// ============================================================
// SCHEDULED PUSH NOTIFICATIONS (OUT-APP)
// ============================================================

/**
 * 1. PUSH: Task Reminder - Checklist công việc
 * Schedule: 08:30 hàng ngày
 * Message: "Hỷ nhắc nhẹ nè, có vài việc nhỏ hôm nay cần dâu/rể làm đó!"
 */
exports.checkTaskReminder = async () => {
  try {
    const Task = require("../models/Task");
    const Phase = require("../models/Phase");
    const now = new Date();
    let notificationsSent = 0;

    // Tìm tất cả wedding events đang active
    const activeEvents = await WeddingEvent.find({
      weddingDate: { $gte: now },
    });

    for (const event of activeEvents) {
      // Tìm tasks chưa hoàn thành của event này
      const phases = await Phase.find({
        _id: { $in: event.phases },
      });

      let hasPendingTasks = false;
      for (const phase of phases) {
        const pendingTasks = await Task.find({
          _id: { $in: phase.tasks },
          completed: false,
        });

        if (pendingTasks.length > 0) {
          hasPendingTasks = true;
          break;
        }
      }

      if (hasPendingTasks) {
        // Gửi push notification cho creator
        await exports.createPushNotification({
          userId: event.creatorId,
          weddingEventId: event._id,
          type: "push_task_reminder",
          title: "💼 Checklist hôm nay",
          message: "Hỷ nhắc nhẹ nè, có vài việc nhỏ hôm nay cần dâu/rể làm đó!",
          data: {
            eventId: event._id,
          },
          priority: "medium",
        });

        notificationsSent++;
      }
    }

    return {
      message: "Task reminder push notifications sent",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in checkTaskReminder:", error);
    throw error;
  }
};

/**
 * 2. PUSH: Budget Reminder - Nhắc update ngân sách
 * Schedule: 20:30 hàng ngày
 * Message: "Dâu/rể nhớ update lại chi tiêu để Hỷ theo dõi giúp bạn nha!"
 */
exports.checkBudgetReminder = async () => {
  try {
    const now = new Date();
    let notificationsSent = 0;

    // Tìm tất cả wedding events đang active
    const activeEvents = await WeddingEvent.find({
      weddingDate: { $gte: now },
    });

    for (const event of activeEvents) {
      // Gửi push notification cho creator
      await exports.createPushNotification({
        userId: event.creatorId,
        weddingEventId: event._id,
        type: "push_budget_reminder",
        title: "💰 Cập nhật ngân sách",
        message: "Dâu/rể nhớ update lại chi tiêu để Hỷ theo dõi giúp bạn nha!",
        data: {
          eventId: event._id,
        },
        priority: "medium",
      });

      notificationsSent++;
    }

    return {
      message: "Budget reminder push notifications sent",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in checkBudgetReminder:", error);
    throw error;
  }
};

/**
 * 3. PUSH: Countdown - Đếm ngược ngày cưới
 * Schedule: 07:30 hàng ngày
 * Message: "Còn [X] ngày nữa đến ngày trọng đại rồi, dâu/rể đã sẵn sàng chưa 💛"
 */
exports.checkCountdownReminder = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let notificationsSent = 0;

    // Tìm wedding events trong tương lai
    const upcomingEvents = await WeddingEvent.find({
      weddingDate: { $gte: now },
    });

    for (const event of upcomingEvents) {
      const weddingDate = new Date(event.weddingDate);
      weddingDate.setHours(0, 0, 0, 0);

      const daysUntil = Math.ceil((weddingDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil > 0) {
        // Gửi push notification mỗi ngày
        await exports.createPushNotification({
          userId: event.creatorId,
          weddingEventId: event._id,
          type: "push_countdown",
          title: "💕 Đếm ngược ngày cưới",
          message: `Còn ${daysUntil} ngày nữa đến ngày trọng đại rồi, dâu/rể đã sẵn sàng chưa 💛`,
          data: {
            eventId: event._id,
            daysRemaining: daysUntil,
          },
          priority: daysUntil <= 7 ? "high" : "medium",
        });

        notificationsSent++;
      }
    }

    return {
      message: "Countdown push notifications sent",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in checkCountdownReminder:", error);
    throw error;
  }
};

/**
 * 4. PUSH: Inactive Reminder - Nhắc quay lại app
 * Schedule: 19:00 hàng ngày
 * Condition: User không sử dụng app trong 3 ngày
 * Message: "Đã vài ngày rồi, còn vài mảnh ghép nhỏ đang đợi bạn hoàn thiện đó."
 */
exports.checkInactiveReminder = async () => {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    let notificationsSent = 0;

    // Tìm users có wedding event active nhưng lâu không login
    const users = await User.find({
      pushToken: { $ne: null },
      lastLogin: { $lt: threeDaysAgo },
    });

    for (const user of users) {
      // Kiểm tra user có wedding event nào đang active không
      const activeEvent = await WeddingEvent.findOne({
        $or: [{ creatorId: user._id }, { members: user._id }],
        weddingDate: { $gte: now },
      });

      if (activeEvent) {
        // Kiểm tra xem đã gửi notification này trong 3 ngày chưa
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: "push_inactive_reminder",
          createdAt: { $gte: threeDaysAgo },
        });

        if (!existingNotification) {
          await exports.createPushNotification({
            userId: user._id,
            weddingEventId: activeEvent._id,
            type: "push_inactive_reminder",
            title: "🌸 Hỷ nhớ bạn quá rồi",
            message:
              "Đã vài ngày rồi, còn vài mảnh ghép nhỏ đang đợi bạn hoàn thiện đó.",
            data: {
              eventId: activeEvent._id,
            },
            priority: "medium",
          });

          notificationsSent++;
        }
      }
    }

    return {
      message: "Inactive reminder push notifications sent",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in checkInactiveReminder:", error);
    throw error;
  }
};

/**
 * 5. PUSH: Random Tips - Nhắc nhở ngẫu nhiên
 * Schedule: Random times trong ngày
 * Messages: 5 messages ngẫu nhiên
 */
exports.sendRandomTip = async () => {
  try {
    const now = new Date();
    let notificationsSent = 0;

    const randomMessages = [
      {
        title: "✨ Moodboard của bạn",
        message: "Check nhẹ moodboard xem còn thiếu gì không nè ✨",
      },
      {
        title: "🤍 Cộng đồng Hỷ",
        message: "Cộng đồng Hỷ có chia sẻ mới, bạn vào xem thử nha 🤍",
      },
      {
        title: "💌 Thiệp mời xinh xắn",
        message: "Tới lúc làm thiệp mời rồi nè 💌 Thử mẫu mới của Hỷ nha?",
      },
      {
        title: "💝 Lời mời yêu thương",
        message:
          "Chuẩn bị gửi lời mời yêu thương chưa? Hỷ có mấy mẫu thiệp mới xinh muốn khoe với bạn nè!",
      },
      {
        title: "💬 Hỏi kinh nghiệm cưới",
        message:
          "Hỡi cô dâu/chú rể tương lai, bạn có muốn hỏi kinh nghiệm cưới trong cộng đồng Hỷ không? Mọi người sẵn lòng giúp bạn đó!",
      },
    ];

    // Chọn ngẫu nhiên 1 message
    const randomTip =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];

    // Tìm tất cả wedding events đang active
    const activeEvents = await WeddingEvent.find({
      weddingDate: { $gte: now },
    });

    for (const event of activeEvents) {
      // Random 30% khả năng gửi (tránh spam)
      if (Math.random() < 0.3) {
        await exports.createPushNotification({
          userId: event.creatorId,
          weddingEventId: event._id,
          type: "push_random_tip",
          title: randomTip.title,
          message: randomTip.message,
          data: {
            eventId: event._id,
          },
          priority: "low",
        });

        notificationsSent++;
      }
    }

    return {
      message: "Random tip push notifications sent",
      count: notificationsSent,
    };
  } catch (error) {
    console.error("Error in sendRandomTip:", error);
    throw error;
  }
};

// ============================================================
// BROADCAST NOTIFICATION (for testing/admin)
// ============================================================

/**
 * Send broadcast push notification to ALL users
 * Use for: announcements, maintenance, feature updates
 *
 * @param {Object} payload - { title, message, data, priority }
 * @returns {Object} - { message, sent, failed }
 */
exports.sendBroadcastNotification = async (payload) => {
  try {
    const {
      title = "📢 Thông báo từ Hỷ",
      message = "Có thông báo mới từ Hỷ, vào app xem nhé!",
      data = {},
      priority = "high",
      type = "system",
    } = payload;

    let sent = 0;
    let failed = 0;

    // Lấy tất cả users có push token
    const users = await User.find({
      pushToken: { $ne: null, $exists: true },
    }).select("_id pushToken");

    console.log(`📢 Broadcasting to ${users.length} users...`);

    for (const user of users) {
      try {
        // Tìm wedding event active của user (nếu có)
        const activeEvent = await WeddingEvent.findOne({
          $or: [{ creatorId: user._id }, { members: user._id }],
          weddingDate: { $gte: new Date() },
        }).select("_id");

        // Tạo notification (in-app)
        await exports.createNotification({
          userId: user._id,
          weddingEventId: activeEvent?._id || user._id, // fallback to userId if no event
          type: type,
          title: title,
          message: message,
          data: data,
          priority: priority,
        });

        // Gửi push notification
        await sendPushNotification(user._id, title, message, data);

        sent++;
      } catch (error) {
        console.error(`Failed to send to user ${user._id}:`, error.message);
        failed++;
      }
    }

    const result = {
      message: "Broadcast notification completed",
      total: users.length,
      sent: sent,
      failed: failed,
      successRate: `${((sent / users.length) * 100).toFixed(2)}%`,
    };

    console.log("✅ Broadcast result:", result);
    return result;
  } catch (error) {
    console.error("Error in sendBroadcastNotification:", error);
    throw error;
  }
};
