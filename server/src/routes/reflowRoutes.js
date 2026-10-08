const express = require('express');
const router = express.Router();
const { getReflowSummary } = require('../controllers/reflowController');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, getReflowSummary);

module.exports = router;
