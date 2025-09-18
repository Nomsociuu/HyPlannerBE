const authMiddleware = require("../middleware/authMiddleware")
const phaseController = require("../controllers/phaseController")
const routes = require('express').Router();

routes.get('/getAllPhases/:eventId', phaseController.getAllPhases)
routes.post('/createPhase/:eventId', phaseController.createPhase)

// chưa sử dụng nhưng sẽ sử dụng trong tương lai
// routes.delete('/deletePhase/:phaseId', phaseController.deletePhase)
// routes.put('/updatePhase/:phaseId', phaseController.updatePhase)

module.exports = routes;