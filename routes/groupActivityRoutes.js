const authMiddleware = require("../middleware/authMiddleware");
const groupActivityController = require("../controllers/groupActivityController");
const routes = require("express").Router();

// Protect all routes - require authentication
routes.use(authMiddleware.protect);

routes.get(
  "/getAllActivities/:eventId",
  groupActivityController.getAllActivities
);
routes.post(
  "/createGroupActivity/:eventId",
  groupActivityController.createGroupActivity
);
routes.put(
  "/updateGroupActivity/:activityGroupId",
  groupActivityController.updateGroupActivity
);
routes.delete(
  "/deleteGroupActivity/:activityGroupId",
  groupActivityController.deleteGroupActivity
);

module.exports = routes;
