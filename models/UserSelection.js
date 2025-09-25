const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSelectionSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  styles: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Style'
  }],
  materials: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Material'
  }],
  necklines: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Neckline'
  }],
  details: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Detail'
  }],
  accessories: {
    veils: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'AccessoryVeil'
    }],
    jewelries: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'AccessoryJewelry'
    }],
    hairpins: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'AccessoryHairpin'
    }],
    crowns: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'AccessoryCrown'
    }]
  },
  flowers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'WeddingFlower'
  }],
  isPinned: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSelection', UserSelectionSchema);