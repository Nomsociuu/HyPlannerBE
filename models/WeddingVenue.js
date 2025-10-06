const mongoose = require('mongoose');

const WeddingVenueSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }, // ví dụ: Nhà hàng, Khách sạn, Resort, Tư gia
  image: { 
    type: String, 
    required: true 
  } // ảnh minh họa
}, { 
  timestamps: true 
});

module.exports = mongoose.model('WeddingVenue', WeddingVenueSchema);