const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");
const routes = require("express").Router();

routes.get("/getAllTasks/:phaseId", taskController.getAllTasks);

routes.get("/getTask/:taskId", taskController.getTask);

routes.post(
  "/createTask/:phaseId",
  authMiddleware.protect,
  taskController.createTask
);

routes.put(
  "/markCompleted/:taskId",
  authMiddleware.protect,
  taskController.markCompleted
);

routes.put(
  "/updateTask/:taskId",
  authMiddleware.protect,
  taskController.updateTask
);

routes.delete(
  "/deleteTask/:taskId",
  authMiddleware.protect,
  taskController.deleteTask
);

module.exports = routes;
