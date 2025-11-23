const mongoose = require('mongoose');
const { Schema } = mongoose;

const VestDecorationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('VestDecoration', VestDecorationSchema);