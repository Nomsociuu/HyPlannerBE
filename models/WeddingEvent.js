const mongoose = require("mongoose");

const weddingEventSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brideName: {
      type: String,
      required: true,
    },
    groomName: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    timeToMarried: {
      type: Date,
      required: true,
    },
    member: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
  },
  { collection: "weddingEvents", timestamps: true }
);
module.exports = mongoose.model("weddingEvent", weddingEventSchema);
