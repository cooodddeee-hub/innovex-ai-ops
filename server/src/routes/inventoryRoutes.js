const express = require('express');
const router = express.Router();
const { getInventorySummary } = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, getInventorySummary);

module.exports = router;
