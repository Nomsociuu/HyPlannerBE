const mongoose = require("mongoose");

const groupActivitySchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    // groupActivityTimeStart: {
    //   type: Date,
    //   required: true,
    // },
    // groupActivityTimeEnd: {
    //   type: Date,
    //   required: true,
    // },
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "activity",
      },
    ],
  },
  { collection: "groupActivities" }
);
module.exports = mongoose.model("groupActivity", groupActivitySchema);
