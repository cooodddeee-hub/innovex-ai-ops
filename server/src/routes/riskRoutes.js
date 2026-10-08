const express = require('express');
const router = express.Router();
const { getRisks } = require('../controllers/riskController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getRisks);

module.exports = router;
