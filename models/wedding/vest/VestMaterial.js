const mongoose = require('mongoose');
const { Schema } = mongoose;

const VestMaterialSchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('VestMaterial', VestMaterialSchema);