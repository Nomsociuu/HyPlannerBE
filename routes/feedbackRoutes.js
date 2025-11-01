const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// User routes
router.post("/create/:id", feedbackController.createFeedback);
router.put("/update/:id", feedbackController.updateFeedback);
router.get("/my-feedback/:id", feedbackController.getMyFeedback);
router.delete("/delete/:id", feedbackController.deleteFeedback);

router.get("/all", feedbackController.getAllFeedback);
router.get("/statistics", feedbackController.getFeedbackStatistics);

module.exports = router;