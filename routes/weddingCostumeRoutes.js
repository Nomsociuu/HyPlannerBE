const express = require("express");
const router = express.Router();
const { cache } = require("../middleware/cache"); // ✅ Import cache middleware
const {
  getAllStyles,
  createStyle,
  getAllMaterials,
  createMaterial,
  getAllNecklines,
  createNeckline,
  getAllDetails,
  createDetail,
  getAllVeils,
  createVeil,
  getAllJewelry,
  createJewelry,
  getAllHairpins,
  createHairpin,
  getAllCrowns,
  createCrown,
  getAllFlowers,
  createFlower,
  getAllVestStyles,
  createVestStyle,
  getAllVestColors,
  createVestColor,
  getAllVestMaterials,
  createVestMaterial,
  getAllVestLapels,
  createVestLapel,
  getAllVestPockets,
  createVestPocket,
  getAllVestDecorations,
  createVestDecoration,
  getAllBrideEngageStyles,
  createBrideEngageStyle,
  getAllBrideEngageMaterials,
  createBrideEngageMaterial,
  getAllBrideEngagePatterns,
  createBrideEngagePattern,
  getAllBrideEngageHeadwears,
  createBrideEngageHeadwear,
  getAllGroomEngageOutfits,
  createGroomEngageOutfit,
  getAllGroomEngageAccessories,
  createGroomEngageAccessory,
  getAllWeddingToneColors,
  createWeddingToneColor,
  getAllEngageToneColors,
  createEngageToneColor,
  getAllWeddingVenues,
  createWeddingVenue,
  getAllWeddingThemes,
  createWeddingTheme,
} = require("../controllers/weddingCostumeController");

// ✅ Cache duration: 24 hours (86400 seconds) for static data
const CACHE_DURATION = 86400;

// Style routes
router.get("/styles", cache(CACHE_DURATION), getAllStyles);
router.post("/styles", createStyle);

// Material routes
router.get("/materials", cache(CACHE_DURATION), getAllMaterials);
router.post("/materials", createMaterial);

// Neckline routes
router.get("/necklines", cache(CACHE_DURATION), getAllNecklines);
router.post("/necklines", createNeckline);

// Detail routes
router.get("/details", cache(CACHE_DURATION), getAllDetails);
router.post("/details", createDetail);

// Accessories routes
// Veil routes
router.get("/accessories/veils", cache(CACHE_DURATION), getAllVeils);
router.post("/accessories/veils", createVeil);

// Jewelry routes
router.get("/accessories/jewelry", cache(CACHE_DURATION), getAllJewelry);
router.post("/accessories/jewelry", createJewelry);

// Hairpin routes
router.get("/accessories/hairpins", cache(CACHE_DURATION), getAllHairpins);
router.post("/accessories/hairpins", createHairpin);

// Crown routes
router.get("/accessories/crowns", cache(CACHE_DURATION), getAllCrowns);
router.post("/accessories/crowns", createCrown);

// Wedding Flower routes
router.get("/flowers", cache(CACHE_DURATION), getAllFlowers);
router.post("/flowers", createFlower);

// Vest routes
// VestStyle routes
router.get("/vest/styles", cache(CACHE_DURATION), getAllVestStyles);
router.post("/vest/styles", createVestStyle);

// VestColor routes
router.get("/vest/colors", cache(CACHE_DURATION), getAllVestColors);
router.post("/vest/colors", createVestColor);

// VestMaterial routes
router.get("/vest/materials", cache(CACHE_DURATION), getAllVestMaterials);
router.post("/vest/materials", createVestMaterial);

// VestLapel routes
router.get("/vest/lapels", cache(CACHE_DURATION), getAllVestLapels);
router.post("/vest/lapels", createVestLapel);

// VestPocket routes
router.get("/vest/pockets", cache(CACHE_DURATION), getAllVestPockets);
router.post("/vest/pockets", createVestPocket);

// VestDecoration routes
router.get("/vest/decorations", cache(CACHE_DURATION), getAllVestDecorations);
router.post("/vest/decorations", createVestDecoration);

// Bride Engage routes
// BrideEngageStyle routes
router.get(
  "/bride-engage/styles",
  cache(CACHE_DURATION),
  getAllBrideEngageStyles
);
router.post("/bride-engage/styles", createBrideEngageStyle);

// BrideEngageMaterial routes
router.get(
  "/bride-engage/materials",
  cache(CACHE_DURATION),
  getAllBrideEngageMaterials
);
router.post("/bride-engage/materials", createBrideEngageMaterial);

// BrideEngagePattern routes
router.get(
  "/bride-engage/patterns",
  cache(CACHE_DURATION),
  getAllBrideEngagePatterns
);
router.post("/bride-engage/patterns", createBrideEngagePattern);

// BrideEngageHeadwear routes
router.get(
  "/bride-engage/headwears",
  cache(CACHE_DURATION),
  getAllBrideEngageHeadwears
);
router.post("/bride-engage/headwears", createBrideEngageHeadwear);

// Groom Engage routes
// GroomEngageOutfit routes
router.get(
  "/groom-engage/outfits",
  cache(CACHE_DURATION),
  getAllGroomEngageOutfits
);
router.post("/groom-engage/outfits", createGroomEngageOutfit);

// GroomEngageAccessory routes
router.get(
  "/groom-engage/accessories",
  cache(CACHE_DURATION),
  getAllGroomEngageAccessories
);
router.post("/groom-engage/accessories", createGroomEngageAccessory);

// Tone Color routes
// WeddingToneColor routes
router.get(
  "/wedding-tone-colors",
  cache(CACHE_DURATION),
  getAllWeddingToneColors
);
router.post("/wedding-tone-colors", createWeddingToneColor);

// EngageToneColor routes
router.get(
  "/engage-tone-colors",
  cache(CACHE_DURATION),
  getAllEngageToneColors
);
router.post("/engage-tone-colors", createEngageToneColor);

// WeddingVenue routes
router.get("/wedding-venues", cache(CACHE_DURATION), getAllWeddingVenues);
router.post("/wedding-venues", createWeddingVenue);

// WeddingTheme routes
router.get("/wedding-themes", cache(CACHE_DURATION), getAllWeddingThemes);
router.post("/wedding-themes", createWeddingTheme);

module.exports = router;
