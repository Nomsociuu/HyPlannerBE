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
router.get("/my-public-albums", albumController.getMyPublicAlbums);
router.get("/saved", albumController.getSavedAlbums);
router.get("/featured", albumController.getFeaturedAlbums);
router.get("/trending", albumController.getTrendingAlbums);
router.get("/:id", albumController.getAlbumById);
router.get("/:id/check-interaction", albumController.checkAlbumInteraction);
router.put("/:id", albumController.updateAlbum);
router.put("/:id/publish", albumController.publishAlbum);
router.delete("/:id", albumController.deleteAlbum);

// Album interactions
router.post("/:id/like", albumController.likeAlbum);
router.delete("/:id/like", albumController.unlikeAlbum);
router.post("/:id/save", albumController.saveAlbum);
router.delete("/:id/save", albumController.unsaveAlbum);

// Selection management
router.post("/:id/add-selection", albumController.addSelectionToAlbum);
router.post("/:id/remove-selection", albumController.removeSelectionFromAlbum);

module.exports = router;
