const authMiddleware = require("../middleware/authMiddleware");
const weddingEventController = require("../controllers/weddingEventController");
const routes = require("express").Router();

// routes.get('/getAllWeddingEvents', weddingEventController.getAllWeddingEvents, authMiddleware.protect) for developer
routes.get(
  "/getWeddingEvent/:eventId",
  authMiddleware.protect,
  weddingEventController.getWeddingEvent
);

routes.get(
  "/getUserWeddingEvents/:userId",
  weddingEventController.getUserWeddingEvents
);

routes.post(
  "/createWeddingEvent",
  authMiddleware.protect,
  weddingEventController.createWeddingEvent
);

routes.post(
  "/addMember",
  authMiddleware.protect,
  weddingEventController.joinWeddingEvent
);

routes.post(
  "/leaveWeddingEvent",
  authMiddleware.protect,
  weddingEventController.leaveWeddingEvent
);

routes.post("/checkAndInsertTasks", weddingEventController.checkAndInsertTasks);
routes.post(
  "/checkAndInsertActivities",
  weddingEventController.checkAndInsertActivities
);
routes.get(
  "/checkEventData/:eventId",
  authMiddleware.protect,
  weddingEventController.checkEventData
);

routes.get(
  "/check-user",
  authMiddleware.protect,
  weddingEventController.checkUserInEvent
);

module.exports = routes;
