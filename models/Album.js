const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlbumSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: {
    type: String,
    required: true
  },
  selections: [{
    type: Schema.Types.ObjectId,
    ref: 'UserSelection'
  }],
  note: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Album', AlbumSchema);