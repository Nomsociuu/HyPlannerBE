const mongoose = require('mongoose');
const { Schema } = mongoose;

const BrideEngageHeadwearSchema = new Schema({
  name: { type: String, required: true, unique: true }, // ví dụ: Khăn vành dây, Khăn lụa, Mấn...
  image: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrideEngageHeadwear', BrideEngageHeadwearSchema);