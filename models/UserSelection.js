const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSelectionSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  type: {
    type: String,
    enum: ['wedding-dress', 'vest', 'bride-engage', 'groom-engage', 'tone-color', 'wedding-venue', 'wedding-theme'],
    required: true
  },
  // Wedding Dress fields (chỉ sử dụng khi type = 'wedding-dress')
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
  // Vest fields (chỉ sử dụng khi type = 'vest')
  vestStyles: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestStyle'
  }],
  vestColors: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestColor'
  }],
  vestMaterials: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestMaterial'
  }],
  vestLapels: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestLapel'
  }],
  vestPockets: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestPocket'
  }],
  vestDecorations: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'VestDecoration'
  }],
  // Bride Engage fields (chỉ sử dụng khi type = 'bride-engage')
  brideEngageStyles: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'BrideEngageStyle'
  }],
  brideEngageMaterials: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'BrideEngageMaterial'
  }],
  brideEngagePatterns: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'BrideEngagePattern'
  }],
  brideEngageHeadwears: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'BrideEngageHeadwear'
  }],
  // Groom Engage fields (chỉ sử dụng khi type = 'groom-engage')
  groomEngageOutfits: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'GroomEngageOutfit'
  }],
  groomEngageAccessories: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'GroomEngageAccessory'
  }],
  // Tone Color fields (sử dụng khi type = 'tone-color')
  // Chứa mix của WeddingToneColor và EngageToneColor IDs
  weddingToneColors: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'WeddingToneColor'
  }],
  engageToneColors: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'EngageToneColor'
  }],
  // Wedding Venue fields (sử dụng khi type = 'wedding-venue')
  weddingVenues: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'WeddingVenue'
  }],
  // Wedding Theme fields (sử dụng khi type = 'wedding-theme')
  weddingThemes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'WeddingTheme'
  }],
  isPinned: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSelection', UserSelectionSchema);