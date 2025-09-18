const authMiddleware = require("../middleware/authMiddleware")
const weddingEventsController = require("../controllers/weddingEventsController")
const routes = require('express').Router();

// routes.get('/getAllWeddingEvents', weddingEventsController.getAllWeddingEvents, authMiddleware.protect) for developer
routes.get('/getWeddingEvent/:eventId', weddingEventsController.getWeddingEvent, authMiddleware.protect)

routes.get('/getUserWeddingEvents/:userId', weddingEventsController.getUserWeddingEvents)

routes.post('/createWeddingEvent', weddingEventsController.createWeddingEvent)

routes.post('/addMember', weddingEventsController.joinWeddingEvent)

routes.post('/leaveWeddingEvent', weddingEventsController.leaveWeddingEvent)

module.exports = routes;