const authMiddleware = require("../middleware/authMiddleware")
const taskController = require("../controllers/taskController")
const routes = require('express').Router();

routes.get('/getAllTasks/:phaseId', taskController.getAllTasks)

routes.get('/getTask/:taskId', taskController.getTask)

routes.post('/createTask/:phaseId', taskController.createTask)

routes.put('/markCompleted/:taskId', taskController.markCompleted)

routes.put('/updateTask/:taskId', taskController.updateTask)

routes.delete('/deleteTask/:taskId', taskController.deleteTask)

module.exports = routes;