const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
    },
    taskNote: {
      type: String,
    },
    // expectedBudget: {
    //   type: Number,
    //   default: 0,
    // },
    // actualBudget: {
    //   type: Number,
    //   default: 0,
    // },
    member: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          index: true,
        },
      ],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { collection: "tasks", timestamps: true }
);
module.exports = mongoose.model("task", taskSchema);
