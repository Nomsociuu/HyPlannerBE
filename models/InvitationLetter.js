// models/InvitationLetter.js

const mongoose = require("mongoose");

// --- BẮT ĐẦU PHẦN CẬP NHẬT MODEL ---

// Định nghĩa schema cho các mục con để code sạch hơn
const LoveStorySchema = new mongoose.Schema({
  title: String,
  time: String,
  content: String,
  image: String,
});

const EventSchema = new mongoose.Schema({
  name: String,
  time: String,
  venue: String,
  address: String,
  mapLink: String,
  image: String,
});

const GuestbookMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const invitationLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    templateId: {
      type: String,
      required: true,
    },
    groomName: {
      type: String,
      required: [true, "Vui lòng nhập tên chú rể"],
    },
    brideName: {
      type: String,
      required: [true, "Vui lòng nhập tên cô dâu"],
    },
    weddingDate: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },

    // --- Thêm các trường mới ở đây ---
    aboutCouple: {
      type: String,
      default: "", // Lời giới thiệu về cặp đôi
    },
    youtubeUrl: {
      type: String,
      default: null,
    },
    loveStory: {
      type: [LoveStorySchema],
      default: [],
    },
    album: {
      type: [String], // Mảng chứa các URL của ảnh
      default: [],
    },
    events: {
      type: [EventSchema],
      default: [],
    },
    guestbookMessages: {
      type: [GuestbookMessageSchema],
      default: [],
    },
    // Bạn có thể thêm các trường khác ở đây trong tương lai
  },
  {
    timestamps: true,
  }
);

// --- KẾT THÚC PHẦN CẬP NHẬT MODEL ---

const InvitationLetter = mongoose.model(
  "InvitationLetter",
  invitationLetterSchema
);

module.exports = InvitationLetter;
