const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { 
    collection: "feedbacks", 
    timestamps: true 
  }
);

// Index để đảm bảo mỗi user chỉ có 1 feedback
feedbackSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);