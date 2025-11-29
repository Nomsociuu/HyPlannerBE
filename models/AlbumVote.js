const mongoose = require("mongoose");

const albumVoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo một user chỉ vote một album một lần
albumVoteSchema.index({ userId: 1, albumId: 1 }, { unique: true });

module.exports = mongoose.model("AlbumVote", albumVoteSchema);
