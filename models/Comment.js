const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
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
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = comment gốc, có giá trị = reply
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
    totalReplies: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "comments",
    timestamps: true,
  }
);

// Index để tối ưu query
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
