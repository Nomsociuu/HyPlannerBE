const authMiddleware = require("../middleware/authMiddleware");
const weddingEventsController = require("../controllers/weddingEventsController");
const routes = require("express").Router();

// routes.get('/getAllWeddingEvents', weddingEventsController.getAllWeddingEvents, authMiddleware.protect) for developer
routes.get(
  "/getWeddingEvent/:eventId",
  weddingEventsController.getWeddingEvent,
  authMiddleware.protect
);

routes.get(
  "/getUserWeddingEvents/:userId",
  weddingEventsController.getUserWeddingEvents
);

routes.post("/createWeddingEvent", weddingEventsController.createWeddingEvent, authMiddleware.protect);

routes.post("/addMember", weddingEventsController.joinWeddingEvent, authMiddleware.protect);

routes.post("/leaveWeddingEvent", weddingEventsController.leaveWeddingEvent, authMiddleware.protect);

routes.post("/checkAndInsertTasks", weddingEventsController.checkAndInsertTasks);
routes.post("/checkAndInsertActivities", weddingEventsController.checkAndInsertActivities);
routes.get("/checkEventData/:eventId", weddingEventsController.checkEventData, authMiddleware.protect);

routes.get(
  "/check-user",
  authMiddleware.protect,
  weddingEventsController.checkUserInEvent
);

module.exports = routes;
