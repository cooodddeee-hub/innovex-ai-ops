const express = require('express');
const router = express.Router();
const { getProductionSummary } = require('../controllers/productionController');
const { requireAuth } = require('../middleware/auth');

router.get('/material-consumption/summary', requireAuth, getProductionSummary);

module.exports = router;
