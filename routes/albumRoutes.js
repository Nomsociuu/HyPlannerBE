const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Album CRUD routes
router.post("/", albumController.createAlbum);
router.get("/", albumController.getAllAlbums);
router.get("/my-albums", albumController.getMyAlbums);
router.get("/featured", albumController.getFeaturedAlbums);
router.get("/:id", albumController.getAlbumById);
router.put("/:id", albumController.updateAlbum);
router.delete("/:id", albumController.deleteAlbum);

// Selection management
router.post("/:id/add-selection", albumController.addSelectionToAlbum);
router.post("/:id/remove-selection", albumController.removeSelectionFromAlbum);

module.exports = router;
