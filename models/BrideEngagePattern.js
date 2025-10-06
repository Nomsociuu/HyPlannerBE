const mongoose = require('mongoose');
const { Schema } = mongoose;

const BrideEngagePatternSchema = new Schema({
  name: { type: String, required: true, unique: true }, // ví dụ: Ren nổi, Thêu hoa, Đính hạt...
  image: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrideEngagePattern', BrideEngagePatternSchema);