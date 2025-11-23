const Style = require("../models/Style");
const Material = require("../models/Material");
const Neckline = require("../models/Neckline");
const Detail = require("../models/Detail");
const AccessoryVeil = require("../models/wedding/accessories/AccessoryVeil");
const AccessoryJewelry = require("../models/wedding/accessories/AccessoryJewelry");
const AccessoryHairpin = require("../models/wedding/accessories/AccessoryHairpin");
const AccessoryCrown = require("../models/wedding/accessories/AccessoryCrown");
const WeddingFlower = require("../models/WeddingFlower");
const VestStyle = require("../models/wedding/vest/VestStyle");
const VestColor = require("../models/wedding/vest/VestColor");
const VestMaterial = require("../models/wedding/vest/VestMaterial");
const VestLapel = require("../models/wedding/vest/VestLapel");
const VestPocket = require("../models/wedding/vest/VestPocket");
const VestDecoration = require("../models/wedding/vest/VestDecoration");
const BrideEngageStyle = require("../models/wedding/bride/BrideEngageStyle");
const BrideEngageMaterial = require("../models/wedding/bride/BrideEngageMaterial");
const BrideEngagePattern = require("../models/wedding/bride/BrideEngagePattern");
const BrideEngageHeadwear = require("../models/wedding/bride/BrideEngageHeadwear");
const GroomEngageOutfit = require("../models/wedding/groom/GroomEngageOutfit");
const GroomEngageAccessory = require("../models/wedding/groom/GroomEngageAccessory");
const WeddingToneColor = require("../models/WeddingToneColor");
const EngageToneColor = require("../models/EngageToneColor");
const WeddingVenue = require("../models/WeddingVenue");
const WeddingTheme = require("../models/WeddingTheme");

// Style Controllers
exports.getAllStyles = async (req, res) => {
  try {
    const styles = await Style.find();
    res.status(200).json({
      success: true,
      data: styles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createStyle = async (req, res) => {
  try {
    const style = await Style.create(req.body);
    res.status(201).json({
      success: true,
      data: style,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Material Controllers
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Neckline Controllers
exports.getAllNecklines = async (req, res) => {
  try {
    const necklines = await Neckline.find();
    res.status(200).json({
      success: true,
      data: necklines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createNeckline = async (req, res) => {
  try {
    const neckline = await Neckline.create(req.body);
    res.status(201).json({
      success: true,
      data: neckline,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Detail Controllers
exports.getAllDetails = async (req, res) => {
  try {
    const details = await Detail.find();
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createDetail = async (req, res) => {
  try {
    const detail = await Detail.create(req.body);
    res.status(201).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Veil Controllers
exports.getAllVeils = async (req, res) => {
  try {
    const veils = await AccessoryVeil.find();
    res.status(200).json({
      success: true,
      data: veils,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVeil = async (req, res) => {
  try {
    const veil = await AccessoryVeil.create(req.body);
    res.status(201).json({
      success: true,
      data: veil,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Jewelry Controllers
exports.getAllJewelry = async (req, res) => {
  try {
    const jewelry = await AccessoryJewelry.find();
    res.status(200).json({
      success: true,
      data: jewelry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createJewelry = async (req, res) => {
  try {
    const jewelry = await AccessoryJewelry.create(req.body);
    res.status(201).json({
      success: true,
      data: jewelry,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Hairpin Controllers
exports.getAllHairpins = async (req, res) => {
  try {
    const hairpins = await AccessoryHairpin.find();
    res.status(200).json({
      success: true,
      data: hairpins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createHairpin = async (req, res) => {
  try {
    const hairpin = await AccessoryHairpin.create(req.body);
    res.status(201).json({
      success: true,
      data: hairpin,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Crown Controllers
exports.getAllCrowns = async (req, res) => {
  try {
    const crowns = await AccessoryCrown.find();
    res.status(200).json({
      success: true,
      data: crowns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createCrown = async (req, res) => {
  try {
    const crown = await AccessoryCrown.create(req.body);
    res.status(201).json({
      success: true,
      data: crown,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Wedding Flower Controllers
exports.getAllFlowers = async (req, res) => {
  try {
    const flowers = await WeddingFlower.find();
    res.status(200).json({
      success: true,
      data: flowers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createFlower = async (req, res) => {
  try {
    const flower = await WeddingFlower.create(req.body);
    res.status(201).json({
      success: true,
      data: flower,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestStyle Controllers
exports.getAllVestStyles = async (req, res) => {
  try {
    const vestStyles = await VestStyle.find();
    res.status(200).json({
      success: true,
      data: vestStyles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestStyle = async (req, res) => {
  try {
    const vestStyle = await VestStyle.create(req.body);
    res.status(201).json({
      success: true,
      data: vestStyle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestColor Controllers
exports.getAllVestColors = async (req, res) => {
  try {
    const vestColors = await VestColor.find();
    res.status(200).json({
      success: true,
      data: vestColors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestColor = async (req, res) => {
  try {
    const vestColor = await VestColor.create(req.body);
    res.status(201).json({
      success: true,
      data: vestColor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestMaterial Controllers
exports.getAllVestMaterials = async (req, res) => {
  try {
    const vestMaterials = await VestMaterial.find();
    res.status(200).json({
      success: true,
      data: vestMaterials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestMaterial = async (req, res) => {
  try {
    const vestMaterial = await VestMaterial.create(req.body);
    res.status(201).json({
      success: true,
      data: vestMaterial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestLapel Controllers
exports.getAllVestLapels = async (req, res) => {
  try {
    const vestLapels = await VestLapel.find();
    res.status(200).json({
      success: true,
      data: vestLapels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestLapel = async (req, res) => {
  try {
    const vestLapel = await VestLapel.create(req.body);
    res.status(201).json({
      success: true,
      data: vestLapel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestPocket Controllers
exports.getAllVestPockets = async (req, res) => {
  try {
    const vestPockets = await VestPocket.find();
    res.status(200).json({
      success: true,
      data: vestPockets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestPocket = async (req, res) => {
  try {
    const vestPocket = await VestPocket.create(req.body);
    res.status(201).json({
      success: true,
      data: vestPocket,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// VestDecoration Controllers
exports.getAllVestDecorations = async (req, res) => {
  try {
    const vestDecorations = await VestDecoration.find();
    res.status(200).json({
      success: true,
      data: vestDecorations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createVestDecoration = async (req, res) => {
  try {
    const vestDecoration = await VestDecoration.create(req.body);
    res.status(201).json({
      success: true,
      data: vestDecoration,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// BrideEngageStyle Controllers
exports.getAllBrideEngageStyles = async (req, res) => {
  try {
    const brideEngageStyles = await BrideEngageStyle.find();
    res.status(200).json({
      success: true,
      data: brideEngageStyles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createBrideEngageStyle = async (req, res) => {
  try {
    const brideEngageStyle = await BrideEngageStyle.create(req.body);
    res.status(201).json({
      success: true,
      data: brideEngageStyle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// BrideEngageMaterial Controllers
exports.getAllBrideEngageMaterials = async (req, res) => {
  try {
    const brideEngageMaterials = await BrideEngageMaterial.find();
    res.status(200).json({
      success: true,
      data: brideEngageMaterials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createBrideEngageMaterial = async (req, res) => {
  try {
    const brideEngageMaterial = await BrideEngageMaterial.create(req.body);
    res.status(201).json({
      success: true,
      data: brideEngageMaterial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// BrideEngagePattern Controllers
exports.getAllBrideEngagePatterns = async (req, res) => {
  try {
    const brideEngagePatterns = await BrideEngagePattern.find();
    res.status(200).json({
      success: true,
      data: brideEngagePatterns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createBrideEngagePattern = async (req, res) => {
  try {
    const brideEngagePattern = await BrideEngagePattern.create(req.body);
    res.status(201).json({
      success: true,
      data: brideEngagePattern,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// BrideEngageHeadwear Controllers
exports.getAllBrideEngageHeadwears = async (req, res) => {
  try {
    const brideEngageHeadwears = await BrideEngageHeadwear.find();
    res.status(200).json({
      success: true,
      data: brideEngageHeadwears,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createBrideEngageHeadwear = async (req, res) => {
  try {
    const brideEngageHeadwear = await BrideEngageHeadwear.create(req.body);
    res.status(201).json({
      success: true,
      data: brideEngageHeadwear,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GroomEngageOutfit Controllers
exports.getAllGroomEngageOutfits = async (req, res) => {
  try {
    const groomEngageOutfits = await GroomEngageOutfit.find();
    res.status(200).json({
      success: true,
      data: groomEngageOutfits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createGroomEngageOutfit = async (req, res) => {
  try {
    const groomEngageOutfit = await GroomEngageOutfit.create(req.body);
    res.status(201).json({
      success: true,
      data: groomEngageOutfit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GroomEngageAccessory Controllers
exports.getAllGroomEngageAccessories = async (req, res) => {
  try {
    const groomEngageAccessories = await GroomEngageAccessory.find();
    res.status(200).json({
      success: true,
      data: groomEngageAccessories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createGroomEngageAccessory = async (req, res) => {
  try {
    const groomEngageAccessory = await GroomEngageAccessory.create(req.body);
    res.status(201).json({
      success: true,
      data: groomEngageAccessory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// WeddingToneColor Controllers
exports.getAllWeddingToneColors = async (req, res) => {
  try {
    const weddingToneColors = await WeddingToneColor.find();
    res.status(200).json({
      success: true,
      data: weddingToneColors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createWeddingToneColor = async (req, res) => {
  try {
    const weddingToneColor = await WeddingToneColor.create(req.body);
    res.status(201).json({
      success: true,
      data: weddingToneColor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// EngageToneColor Controllers
exports.getAllEngageToneColors = async (req, res) => {
  try {
    const engageToneColors = await EngageToneColor.find();
    res.status(200).json({
      success: true,
      data: engageToneColors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createEngageToneColor = async (req, res) => {
  try {
    const engageToneColor = await EngageToneColor.create(req.body);
    res.status(201).json({
      success: true,
      data: engageToneColor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// WeddingVenue Controllers
exports.getAllWeddingVenues = async (req, res) => {
  try {
    const weddingVenues = await WeddingVenue.find();
    res.status(200).json({
      success: true,
      data: weddingVenues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createWeddingVenue = async (req, res) => {
  try {
    const weddingVenue = await WeddingVenue.create(req.body);
    res.status(201).json({
      success: true,
      data: weddingVenue,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// WeddingTheme Controllers
exports.getAllWeddingThemes = async (req, res) => {
  try {
    const weddingThemes = await WeddingTheme.find();
    res.status(200).json({
      success: true,
      data: weddingThemes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createWeddingTheme = async (req, res) => {
  try {
    const weddingTheme = await WeddingTheme.create(req.body);
    res.status(201).json({
      success: true,
      data: weddingTheme,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
