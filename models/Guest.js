const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    weddingEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeddingEvent",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    relationship: {
      type: String,
      enum: ["family", "friend", "colleague", "other"],
      default: "friend",
    },
    group: {
      type: String,
      enum: ["groom", "bride", "both"],
      required: true,
    },
    category: {
      type: String, // Tùy chỉnh: "VIP", "Gia đình gần", "Bạn thân"...
      trim: true,
    },
    numberOfCompanions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGuests: {
      type: Number,
      default: 1, // Bản thân + số người đi cùng
      min: 1,
    },
    invitationStatus: {
      type: String,
      enum: ["not_sent", "sent", "delivered", "opened"],
      default: "not_sent",
    },
    attendanceStatus: {
      type: String,
      enum: ["pending", "confirmed", "declined", "no_response"],
      default: "pending",
    },
    tableNumber: {
      type: Number,
      min: 0,
    },
    seatNumber: {
      type: Number,
      min: 0,
    },
    dietaryRestrictions: {
      type: String, // "Ăn chay", "Không ăn hải sản"...
      trim: true,
    },
    notes: {
      type: String, // "Thích bàn gần sân khấu", "VIP"...
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    gift: {
      type: {
        type: String,
        enum: ["money", "item", "both", "none"],
        default: "none",
      },
      amount: {
        type: Number,
        min: 0,
      },
      description: {
        type: String,
        trim: true,
      },
      receivedDate: {
        type: Date,
      },
      receivedMethod: {
        type: String,
        enum: [
          "at_event",
          "bank_transfer",
          "before_event",
          "after_event",
          "not_received",
        ],
        default: "not_received",
      },
      returnedGift: {
        type: Boolean,
        default: false,
      },
    },
    invitationSentDate: {
      type: Date,
    },
    responseDate: {
      type: Date,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Liên kết với thiệp mời cá nhân
    personalInvitationLink: {
      type: String, // URL unique cho từng khách
      trim: true,
    },
    invitationLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvitationLetter",
    },
  },
  {
    collection: "guests",
    timestamps: true,
  }
);

// Index để tối ưu query
guestSchema.index({ weddingEventId: 1, isActive: 1 });
guestSchema.index({ weddingEventId: 1, group: 1 });
guestSchema.index({ weddingEventId: 1, attendanceStatus: 1 });
guestSchema.index({ weddingEventId: 1, invitationStatus: 1 });

// Virtual: Calculate total guests including companions
guestSchema.pre("save", function (next) {
  this.totalGuests = 1 + (this.numberOfCompanions || 0);
  next();
});

module.exports = mongoose.model("Guest", guestSchema);
