const authMiddleware = require("../middleware/authMiddleware");
const weddingEventController = require("../controllers/weddingEventController");
const routes = require("express").Router();

// routes.get('/getAllWeddingEvents', weddingEventController.getAllWeddingEvents, authMiddleware.protect) for developer
routes.get(
  "/getWeddingEvent/:eventId",
  weddingEventController.getWeddingEvent,
  authMiddleware.protect
);

routes.get(
  "/getUserWeddingEvents/:userId",
  weddingEventController.getUserWeddingEvents
);

routes.post(
  "/createWeddingEvent",
  weddingEventController.createWeddingEvent,
  authMiddleware.protect
);

routes.post(
  "/addMember",
  weddingEventController.joinWeddingEvent,
  authMiddleware.protect
);

routes.post(
  "/leaveWeddingEvent",
  weddingEventController.leaveWeddingEvent,
  authMiddleware.protect
);

routes.post("/checkAndInsertTasks", weddingEventController.checkAndInsertTasks);
routes.post(
  "/checkAndInsertActivities",
  weddingEventController.checkAndInsertActivities
);
routes.get(
  "/checkEventData/:eventId",
  weddingEventController.checkEventData,
  authMiddleware.protect
);

routes.get(
  "/check-user",
  authMiddleware.protect,
  weddingEventController.checkUserInEvent
);

module.exports = routes;
