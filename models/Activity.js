const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    activityName: {
      type: String,
      required: true,
    },
    activityNote: {
      type: String,
    },
    expectedBudget: {
      type: Number,
      default: 0,
    },
    actualBudget: {
      type: Number,
      default: 0,
    },
    payer: {
        type: String,
        enum: ['groom', 'bride', 'both'],
        required: true,
    }
  },
  { collection: "activities", timestamps: true }
);
module.exports = mongoose.model("activity", activitySchema);
