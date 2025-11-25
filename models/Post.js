const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // URLs của hình ảnh
      },
    ],
    topicGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TopicGroup",
    },
    linkedAlbumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
    linkedSelectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSelection",
    },
    reactions: {
      like: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      love: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    totalReactions: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    totalSaves: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false, // Cho Inspire Board
    },
  },
  {
    collection: "posts",
    timestamps: true,
  }
);

// Index để tối ưu query
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
