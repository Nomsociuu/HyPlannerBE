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
router.post(
  "/:guestId/update-invitation-status",
  guestController.updateInvitationStatusFromHub
);

// Table suggestions
router.get(
  "/:weddingEventId/table-suggestions",
  guestController.getTableSuggestions
);

// Tags
router.get("/:weddingEventId/popular-tags", guestController.getPopularTags);

// Invitation integration
router.post(
  "/:weddingEventId/generate-invitation-links",
  guestController.generateInvitationLinks
);

// Import/Export
router.post("/import", guestController.importGuests);
router.get("/:weddingEventId/export", guestController.exportGuests);

// Notifications
router.get("/:weddingEventId/notifications", guestController.getNotifications);

// Export PDF
router.get("/:weddingEventId/export-pdf", guestController.exportGuestListPDF);

// Share link management
router.post(
  "/:weddingEventId/create-share-link",
  guestController.createShareLink
);

// Thank you emails
router.post(
  "/:weddingEventId/send-thank-you",
  guestController.sendThankYouEmails
);

module.exports = router;
