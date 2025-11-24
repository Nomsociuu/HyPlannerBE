const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
router.use(protect);

// Guest CRUD
router.post("/create", guestController.createGuest);
router.get("/:weddingEventId", guestController.getAllGuests);
router.put("/:guestId", guestController.updateGuest);
router.delete("/:guestId", guestController.deleteGuest);

// Guest status updates
router.put("/:guestId/attendance", guestController.updateAttendanceStatus);
router.put("/:guestId/gift", guestController.updateGift);

// Table suggestions
router.get(
  "/:weddingEventId/table-suggestions",
  guestController.getTableSuggestions
);

// Import/Export
router.post("/import", guestController.importGuests);
router.get("/:weddingEventId/export", guestController.exportGuests);

// Notifications
router.get("/:weddingEventId/notifications", guestController.getNotifications);

module.exports = router;
