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
router.post('/selections', createSelection);     // Create new selection
router.delete('/selections', deleteSelection);   // Remove pinned selection
router.get('/selections', getUserSelections);    // Get all selections

// Album routes
router.post('/album', createAlbum);
router.get('/albums', getUserAlbums);

module.exports = router;