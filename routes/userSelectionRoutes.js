const express = require('express');
const router = express.Router();
const { 
    createSelection,
    deleteSelection,
    getUserSelections,
    createAlbum,
    getUserAlbums
} = require('../controllers/userSelectionController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// User Selection routes
router.post('/', createSelection);     // Create new selection
router.delete('/', deleteSelection);   // Remove pinned selection
router.get('/', getUserSelections);    // Get all selections

// Album routes
router.post('/albums', createAlbum);
router.get('/albums', getUserAlbums);

module.exports = router;