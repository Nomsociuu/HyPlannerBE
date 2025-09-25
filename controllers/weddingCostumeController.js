const Style = require('../models/Style');
const Material = require('../models/Material');
const Neckline = require('../models/Neckline');
const Detail = require('../models/Detail');
const AccessoryVeil = require('../models/AccessoryVeil');
const AccessoryJewelry = require('../models/AccessoryJewelry');
const AccessoryHairpin = require('../models/AccessoryHairpin');
const AccessoryCrown = require('../models/AccessoryCrown');
const WeddingFlower = require('../models/WeddingFlower');

// Style Controllers
exports.getAllStyles = async (req, res) => {
    try {
        const styles = await Style.find();
        res.status(200).json({
            success: true,
            data: styles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createStyle = async (req, res) => {
    try {
        const style = await Style.create(req.body);
        res.status(201).json({
            success: true,
            data: style
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Material Controllers
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find();
        res.status(200).json({
            success: true,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createMaterial = async (req, res) => {
    try {
        const material = await Material.create(req.body);
        res.status(201).json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Neckline Controllers
exports.getAllNecklines = async (req, res) => {
    try {
        const necklines = await Neckline.find();
        res.status(200).json({
            success: true,
            data: necklines
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createNeckline = async (req, res) => {
    try {
        const neckline = await Neckline.create(req.body);
        res.status(201).json({
            success: true,
            data: neckline
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Detail Controllers
exports.getAllDetails = async (req, res) => {
    try {
        const details = await Detail.find();
        res.status(200).json({
            success: true,
            data: details
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createDetail = async (req, res) => {
    try {
        const detail = await Detail.create(req.body);
        res.status(201).json({
            success: true,
            data: detail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Veil Controllers
exports.getAllVeils = async (req, res) => {
    try {
        const veils = await AccessoryVeil.find();
        res.status(200).json({
            success: true,
            data: veils
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createVeil = async (req, res) => {
    try {
        const veil = await AccessoryVeil.create(req.body);
        res.status(201).json({
            success: true,
            data: veil
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Jewelry Controllers
exports.getAllJewelry = async (req, res) => {
    try {
        const jewelry = await AccessoryJewelry.find();
        res.status(200).json({
            success: true,
            data: jewelry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createJewelry = async (req, res) => {
    try {
        const jewelry = await AccessoryJewelry.create(req.body);
        res.status(201).json({
            success: true,
            data: jewelry
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Hairpin Controllers
exports.getAllHairpins = async (req, res) => {
    try {
        const hairpins = await AccessoryHairpin.find();
        res.status(200).json({
            success: true,
            data: hairpins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createHairpin = async (req, res) => {
    try {
        const hairpin = await AccessoryHairpin.create(req.body);
        res.status(201).json({
            success: true,
            data: hairpin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Crown Controllers
exports.getAllCrowns = async (req, res) => {
    try {
        const crowns = await AccessoryCrown.find();
        res.status(200).json({
            success: true,
            data: crowns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createCrown = async (req, res) => {
    try {
        const crown = await AccessoryCrown.create(req.body);
        res.status(201).json({
            success: true,
            data: crown
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Wedding Flower Controllers
exports.getAllFlowers = async (req, res) => {
    try {
        const flowers = await WeddingFlower.find();
        res.status(200).json({
            success: true,
            data: flowers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createFlower = async (req, res) => {
    try {
        const flower = await WeddingFlower.create(req.body);
        res.status(201).json({
            success: true,
            data: flower
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};