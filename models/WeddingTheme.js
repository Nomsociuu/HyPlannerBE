const mongoose = require('mongoose');

const WeddingThemeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }, // ví dụ: Hiện đại, Truyền thống, Rustic, Luxury, Vintage
  image: { 
    type: String, 
    required: true 
  } // ảnh minh họa
}, { 
  timestamps: true 
});

module.exports = mongoose.model('WeddingTheme', WeddingThemeSchema);