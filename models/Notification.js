const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weddingEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeddingEvent",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        // Guest related
        "guest_response", // Khách cập nhật phản hồi
        "guest_confirmed", // Khách xác nhận tham dự
        "guest_declined", // Khách từ chối
        "table_deadline", // Gần deadline chốt bàn
        "invitation_opened", // Khách mở thiệp mời
        "gift_received", // Nhận quà từ khách

        // Task related
        "task_created", // Công việc mới được tạo
        "task_assigned", // Được giao công việc
        "task_completed", // Công việc hoàn thành
        "task_deadline_approaching", // Sắp đến hạn công việc
        "task_overdue", // Công việc quá hạn

        // Budget related
        "budget_limit_warning", // Cảnh báo gần vượt ngân sách
        "budget_exceeded", // Đã vượt ngân sách
        "budget_item_added", // Chi phí mới được thêm

        // Phase related
        "phase_completed", // Giai đoạn hoàn thành
        "phase_deadline_approaching", // Sắp hết giai đoạn

        // Wedding event related
        "wedding_date_approaching", // Gần ngày cưới (30, 14, 7, 3, 1 ngày)
        "member_joined", // Thành viên mới tham gia
        "member_left", // Thành viên rời khỏi

        // Album & Community related
        "album_created", // Album mới được tạo
        "post_liked", // Bài viết được thích
        "post_commented", // Bài viết được comment

        // System
        "system", // Thông báo hệ thống
        "reminder", // Nhắc nhở chung

        // PUSH NOTIFICATIONS (out-app only)
        "push_task_reminder", // Nhắc công việc hôm nay (08:30)
        "push_budget_reminder", // Nhắc update ngân sách (20:30)
        "push_countdown", // Countdown ngày cưới (07:30)
        "push_inactive_reminder", // Nhắc quay lại app sau 3 ngày (19:00)
        "push_random_tip", // Nhắc nhở ngẫu nhiên
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      // Guest related
      guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
      },
      guestName: String,
      previousStatus: String,
      newStatus: String,
      giftAmount: Number,
      giftDescription: String,

      // Task related
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
      taskName: String,
      phaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Phase",
      },
      phaseName: String,
      assignedBy: String,
      dueDate: Date,

      // Budget related
      budgetItemId: String,
      budgetItemName: String,
      budgetAmount: Number,
      totalBudget: Number,
      currentSpending: Number,
      percentageUsed: Number,

      // Member related
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      memberName: String,

      // Album & Post related
      albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
      },
      albumName: String,
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
      postTitle: String,

      // General
      daysRemaining: Number,
      actionUrl: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Push notification data
    pushNotificationSent: {
      type: Boolean,
      default: false,
    },
    pushNotificationSentDate: {
      type: Date,
    },
  },
  {
    collection: "notifications",
    timestamps: true,
  }
);

// Indexes để tối ưu query
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ weddingEventId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, weddingEventId: 1, createdAt: -1 });

// Auto delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model("Notification", notificationSchema);
