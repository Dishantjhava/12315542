const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduler.controller');

router.get('/depots', controller.getDepots);
router.get('/vehicles', controller.getVehicles);
router.get('/optimize', controller.optimizeAll);
router.get('/optimize/:depotId', controller.optimizeForDepot);

module.exports = router;
