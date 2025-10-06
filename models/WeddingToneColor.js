const mongoose = require('mongoose');
const { Schema } = mongoose;

const WeddingToneColorSchema = new Schema({
  name: { type: String, required: true, unique: true }, // ví dụ: Pastel, Gold, Red-White
  image: { type: String, required: true }                // URL ảnh minh họa
}, {
  timestamps: true
});

module.exports = mongoose.model('WeddingToneColor', WeddingToneColorSchema);