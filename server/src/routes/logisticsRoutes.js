const express = require('express');
const router = express.Router();
const { getLogisticsSummary } = require('../controllers/logisticsController');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, getLogisticsSummary);

module.exports = router;
