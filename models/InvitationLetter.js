const mongoose = require("mongoose");

const invitationLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    templateId: {
      type: String,
      required: true,
    },
    groomName: {
      type: String,
      required: [true, "Vui lòng nhập tên chú rể"],
    },
    brideName: {
      type: String,
      required: [true, "Vui lòng nhập tên cô dâu"],
    },
    weddingDate: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const InvitationLetter = mongoose.model(
  "InvitationLetter",
  invitationLetterSchema
);

module.exports = InvitationLetter;
