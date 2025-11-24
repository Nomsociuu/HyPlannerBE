const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    weddingEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeddingEvent",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    tableName: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String, // "Gần sân khấu", "Khu vực VIP", "Ngoài trời"...
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "tables",
    timestamps: true,
  }
);

// Index
tableSchema.index({ weddingEventId: 1, isActive: 1 });
tableSchema.index({ weddingEventId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
