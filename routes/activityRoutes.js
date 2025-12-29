const authMiddleware = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");
const routes = require("express").Router();

routes.get("/getActivity/:activityId", activityController.getActivity);
routes.post(
  "/createActivity/:groupActivityId",
  authMiddleware.protect,
  activityController.createActivity
);
routes.put(
  "/updateActivity/:activityId",
  authMiddleware.protect,
  activityController.updateActivity
);
routes.delete(
  "/deleteActivity/:activityId",
  authMiddleware.protect,
  activityController.deleteActivity
);

module.exports = routes;
