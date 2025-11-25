const mongoose = require("mongoose");
const { Schema } = mongoose;

const AlbumSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    selections: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserSelection",
      },
    ],
    images: [
      {
        type: String, // URLs của hình ảnh
      },
    ],
    description: {
      type: String,
    },
    note: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
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
    isFeatured: {
      type: Boolean,
      default: false, // Cho Inspire Board
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Album", AlbumSchema);
