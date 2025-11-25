const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "saved_posts",
    timestamps: true,
  }
);

// Đảm bảo một user không lưu cùng một post nhiều lần
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("SavedPost", savedPostSchema);
