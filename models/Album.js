const mongoose = require("mongoose");
const { Schema } = mongoose;

const AlbumSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
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
    customImages: [
      {
        type: String, // URLs của hình ảnh do user upload
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
    shareCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but enforces uniqueness when set
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ COMPOUND INDEXES for common queries
AlbumSchema.index({ user: 1, createdAt: -1 });
AlbumSchema.index({ isPublic: 1, isFeatured: 1, totalVotes: -1 });
AlbumSchema.index({ isPublic: 1, averageRating: -1 });

module.exports = mongoose.model("Album", AlbumSchema);
