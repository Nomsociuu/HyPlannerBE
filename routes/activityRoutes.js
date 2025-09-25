const authMiddleware = require("../middleware/authMiddleware")
const activityController = require("../controllers/activityController")
const routes = require('express').Router();

routes.get('/getActivity/:activityId', activityController.getActivity)
routes.post('/createActivity/:groupActivityId', activityController.createActivity)
routes.put('/updateActivity/:activityId', activityController.updateActivity)
routes.delete('/deleteActivity/:activityId', activityController.deleteActivity)

module.exports = routes;