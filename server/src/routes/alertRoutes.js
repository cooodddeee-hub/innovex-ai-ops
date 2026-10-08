const express = require('express');
const router = express.Router();
const { getAlerts, updateAlertStatus } = require('../controllers/alertController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAlerts);
router.patch('/:id/status', requireAuth, updateAlertStatus);

module.exports = router;
