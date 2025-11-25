const mongoose = require("mongoose");

const topicGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Rustic",
        "DIY",
        "Outdoor Photography",
        "Budget Saving",
        "Venue Selection",
        "Dress & Fashion",
        "Decoration",
        "Food & Catering",
        "Photography",
        "Music & Entertainment",
        "Other",
      ],
      default: "Other",
    },
    coverImage: {
      type: String, // URL của hình ảnh cover
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalMembers: {
      type: Number,
      default: 0,
    },
    totalPosts: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "topic_groups",
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh hơn
topicGroupSchema.index({ name: "text", description: "text" });
topicGroupSchema.index({ category: 1 });

module.exports = mongoose.model("TopicGroup", topicGroupSchema);
