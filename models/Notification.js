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
        "guest_response", // Khách cập nhật phản hồi
        "guest_confirmed", // Khách xác nhận tham dự
        "guest_declined", // Khách từ chối
        "table_deadline", // Gần deadline chốt bàn
        "invitation_opened", // Khách mở thiệp mời
        "gift_received", // Nhận quà từ khách
        "system", // Thông báo hệ thống
        "reminder", // Nhắc nhở chung
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
      // Dữ liệu bổ sung tùy theo type
      guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
      },
      guestName: String,
      previousStatus: String,
      newStatus: String,
      daysRemaining: Number,
      giftAmount: Number,
      giftDescription: String,
      // Có thể thêm các field khác tùy theo type
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
