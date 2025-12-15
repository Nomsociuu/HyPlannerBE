const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema(
  {
    phaseTimeStart: {
      type: Date,
      required: true,
      index: true,
    },
    phaseTimeEnd: {
      type: Date,
      required: true,
      index: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
      },
    ],
  },
  { collection: "phases" }
);
module.exports = mongoose.model("phase", phaseSchema);
