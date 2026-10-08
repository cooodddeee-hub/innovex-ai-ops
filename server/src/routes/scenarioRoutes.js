const express = require('express');
const router = express.Router();
const { runScenario } = require('../controllers/scenarioController');
const { requireAuth } = require('../middleware/auth');

router.post('/simulate', requireAuth, runScenario);

module.exports = router;
