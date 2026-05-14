const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');

router.get('/', controller.getAllNotifications);
router.get('/priority', controller.getPriorityInbox);
router.post('/priority/insert', controller.insertAndGetPriority);

module.exports = router;
