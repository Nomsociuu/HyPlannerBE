const mongoose = require("mongoose");

const weddingEventSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    brideName: {
      type: String,
      required: true,
    },
    groomName: {
      type: String,
      required: true,
    },
    brideFather: {
      type: String,
    },
    brideMother: {
      type: String,
    },
    groomFather: {
      type: String,
    },
    groomMother: {
      type: String,
    },
    budget: {
      type: Number,
      required: true,
    },
    timeToMarried: {
      type: Date,
      required: true,
      index: true,
    },
    member: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    phases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "phase",
      },
    ],
    groupActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupActivity",
      },
    ],
    weddingDate: {
      type: Date,
      default: function () {
        return this.timeToMarried;
      },
    },
    shareLinks: [
      {
        token: {
          type: String,
          required: true,
          unique: true,
        },
        permissions: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  { collection: "weddingEvents", timestamps: true }
);
module.exports = mongoose.model("weddingEvent", weddingEventSchema);
