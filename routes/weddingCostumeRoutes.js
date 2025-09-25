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
    getAllFlowers, createFlower
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

module.exports = router;