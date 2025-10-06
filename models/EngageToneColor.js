const mongoose = require('mongoose');
const { Schema } = mongoose;

const EngageToneColorSchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('EngageToneColor', EngageToneColorSchema);