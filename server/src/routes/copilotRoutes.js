const express = require('express');
const router = express.Router();
const { queryCopilot } = require('../controllers/copilotController');
const { requireAuth } = require('../middleware/auth');

router.post('/query', requireAuth, queryCopilot);

module.exports = router;
