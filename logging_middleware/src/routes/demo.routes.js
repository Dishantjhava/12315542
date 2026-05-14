const express = require('express');
const router = express.Router();
const demo = require('../controllers/demo.controller');

router.get('/health', demo.health);
router.get('/echo', demo.echo);
router.post('/echo', demo.echo);
router.get('/slow', demo.slow);
router.get('/not-found', demo.notFound);
router.get('/error', demo.serverError);

module.exports = router;
