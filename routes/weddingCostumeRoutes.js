const express = require('express');
const router = express.Router();
const { 
    getAllStyles, createStyle,
    getAllMaterials, createMaterial,
    getAllNecklines, createNeckline,
    getAllDetails, createDetail,
    getAllVeils, createVeil,
    getAllJewelry, createJewelry,
    getAllHairpins, createHairpin,
    getAllCrowns, createCrown,
    getAllFlowers, createFlower,
    getAllVestStyles, createVestStyle,
    getAllVestColors, createVestColor,
    getAllVestMaterials, createVestMaterial,
    getAllVestLapels, createVestLapel,
    getAllVestPockets, createVestPocket,
    getAllVestDecorations, createVestDecoration,
    getAllBrideEngageStyles, createBrideEngageStyle,
    getAllBrideEngageMaterials, createBrideEngageMaterial,
    getAllBrideEngagePatterns, createBrideEngagePattern,
    getAllBrideEngageHeadwears, createBrideEngageHeadwear,
    getAllGroomEngageOutfits, createGroomEngageOutfit,
    getAllGroomEngageAccessories, createGroomEngageAccessory,
    getAllWeddingToneColors, createWeddingToneColor,
    getAllEngageToneColors, createEngageToneColor,
    getAllWeddingVenues, createWeddingVenue,
    getAllWeddingThemes, createWeddingTheme
} = require('../controllers/weddingCostumeController');

// Style routes
router.get('/styles', getAllStyles);
router.post('/styles', createStyle);

// Material routes
router.get('/materials', getAllMaterials);
router.post('/materials', createMaterial);

// Neckline routes
router.get('/necklines', getAllNecklines);
router.post('/necklines', createNeckline);

// Detail routes
router.get('/details', getAllDetails);
router.post('/details', createDetail);

// Accessories routes
// Veil routes
router.get('/accessories/veils', getAllVeils);
router.post('/accessories/veils', createVeil);

// Jewelry routes
router.get('/accessories/jewelry', getAllJewelry);
router.post('/accessories/jewelry', createJewelry);

// Hairpin routes
router.get('/accessories/hairpins', getAllHairpins);
router.post('/accessories/hairpins', createHairpin);

// Crown routes
router.get('/accessories/crowns', getAllCrowns);
router.post('/accessories/crowns', createCrown);

// Wedding Flower routes
router.get('/flowers', getAllFlowers);
router.post('/flowers', createFlower);

// Vest routes
// VestStyle routes
router.get('/vest/styles', getAllVestStyles);
router.post('/vest/styles', createVestStyle);

// VestColor routes
router.get('/vest/colors', getAllVestColors);
router.post('/vest/colors', createVestColor);

// VestMaterial routes
router.get('/vest/materials', getAllVestMaterials);
router.post('/vest/materials', createVestMaterial);

// VestLapel routes
router.get('/vest/lapels', getAllVestLapels);
router.post('/vest/lapels', createVestLapel);

// VestPocket routes
router.get('/vest/pockets', getAllVestPockets);
router.post('/vest/pockets', createVestPocket);

// VestDecoration routes
router.get('/vest/decorations', getAllVestDecorations);
router.post('/vest/decorations', createVestDecoration);

// Bride Engage routes
// BrideEngageStyle routes
router.get('/bride-engage/styles', getAllBrideEngageStyles);
router.post('/bride-engage/styles', createBrideEngageStyle);

// BrideEngageMaterial routes
router.get('/bride-engage/materials', getAllBrideEngageMaterials);
router.post('/bride-engage/materials', createBrideEngageMaterial);

// BrideEngagePattern routes
router.get('/bride-engage/patterns', getAllBrideEngagePatterns);
router.post('/bride-engage/patterns', createBrideEngagePattern);

// BrideEngageHeadwear routes
router.get('/bride-engage/headwears', getAllBrideEngageHeadwears);
router.post('/bride-engage/headwears', createBrideEngageHeadwear);

// Groom Engage routes
// GroomEngageOutfit routes
router.get('/groom-engage/outfits', getAllGroomEngageOutfits);
router.post('/groom-engage/outfits', createGroomEngageOutfit);

// GroomEngageAccessory routes
router.get('/groom-engage/accessories', getAllGroomEngageAccessories);
router.post('/groom-engage/accessories', createGroomEngageAccessory);

// Tone Color routes
// WeddingToneColor routes
router.get('/wedding-tone-colors', getAllWeddingToneColors);
router.post('/wedding-tone-colors', createWeddingToneColor);

// EngageToneColor routes
router.get('/engage-tone-colors', getAllEngageToneColors);
router.post('/engage-tone-colors', createEngageToneColor);

// WeddingVenue routes
router.get('/wedding-venues', getAllWeddingVenues);
router.post('/wedding-venues', createWeddingVenue);

// WeddingTheme routes
router.get('/wedding-themes', getAllWeddingThemes);
router.post('/wedding-themes', createWeddingTheme);

module.exports = router;