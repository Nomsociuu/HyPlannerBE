const UserSelection = require('../models/UserSelection');
const Album = require('../models/Album');

// User Selection Controllers
exports.createSelection = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            styleIds, materialIds, necklineIds, detailIds,
            veilIds, jewelryIds, hairpinIds, crownIds,
            flowerIds 
        } = req.body;

        // Create new selection
        let selection = await UserSelection.create({
            user: userId,
            styles: styleIds || [],
            materials: materialIds || [],
            necklines: necklineIds || [],
            details: detailIds || [],
            accessories: {
                veils: veilIds || [],
                jewelries: jewelryIds || [],
                hairpins: hairpinIds || [],
                crowns: crownIds || []
            },
            flowers: flowerIds || [],
            isPinned: true
        });

        // Populate the selection with all referenced documents
        await selection.populate([
            'styles', 'materials', 'necklines', 'details',
            'accessories.veils', 'accessories.jewelries', 
            'accessories.hairpins', 'accessories.crowns',
            'flowers'
        ]);

        res.status(200).json({
            success: true,
            data: selection
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteSelection = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find and delete the pinned selection
        const selection = await UserSelection.findOneAndDelete({ 
            user: userId,
            isPinned: true 
        });
        
        if (!selection) {
            return res.status(404).json({
                success: false,
                message: 'No pinned selection found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Selection unpinned and removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserSelections = async (req, res) => {
    try {
        const userId = req.user._id;
        const selections = await UserSelection.find({ 
            user: userId,
            isPinned: true 
        }).populate([
            'styles', 'materials', 'necklines', 'details',
            'accessories.veils', 'accessories.jewelries', 
            'accessories.hairpins', 'accessories.crowns',
            'flowers'
        ]);

        res.status(200).json({
            success: true,
            data: selections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Album Controllers
exports.createAlbum = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, note } = req.body;

        // Get current pinned selection
        const currentSelection = await UserSelection.findOne({
            user: userId,
            isPinned: true
        }).populate([
            'styles', 'materials', 'necklines', 'details',
            'accessories.veils', 'accessories.jewelries', 
            'accessories.hairpins', 'accessories.crowns',
            'flowers'
        ]);

        if (!currentSelection) {
            return res.status(400).json({
                success: false,
                message: 'No pinned selections found'
            });
        }

        // Create a new selection with the same choices but unpinned
        const newSelection = await UserSelection.create({
            user: userId,
            styles: currentSelection.styles.map(style => style._id),
            materials: currentSelection.materials.map(material => material._id),
            necklines: currentSelection.necklines.map(neckline => neckline._id),
            details: currentSelection.details.map(detail => detail._id),
            accessories: {
                veils: currentSelection.accessories.veils.map(veil => veil._id),
                jewelries: currentSelection.accessories.jewelries.map(jewelry => jewelry._id),
                hairpins: currentSelection.accessories.hairpins.map(hairpin => hairpin._id),
                crowns: currentSelection.accessories.crowns.map(crown => crown._id)
            },
            flowers: currentSelection.flowers.map(flower => flower._id),
            isPinned: false // This selection is now part of an album, so it shouldn't be pinned
        });

        // Create the album with the new selection
        const album = await Album.create({
            user: userId,
            name,
            selections: [newSelection._id],
            note
        });

        await album.populate({
            path: 'selections',
            populate: [
                'styles', 'materials', 'necklines', 'details',
                'accessories.veils', 'accessories.jewelries', 
                'accessories.hairpins', 'accessories.crowns',
                'flowers'
            ]
        });

        res.status(201).json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserAlbums = async (req, res) => {
    try {
        const userId = req.user._id;
        const albums = await Album.find({ user: userId })
            .populate({
                path: 'selections',
                populate: [
                    'styles', 'materials', 'necklines', 'details',
                    'accessories.veils', 'accessories.jewelries', 
                    'accessories.hairpins', 'accessories.crowns',
                    'flowers'
                ]
            });

        res.status(200).json({
            success: true,
            data: albums
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};