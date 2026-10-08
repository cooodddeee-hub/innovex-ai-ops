const express = require('express');
const router = express.Router();
const { runAnalysis, getAnalyses, getAnalysisById } = require('../controllers/analysisController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/:datasetId', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), runAnalysis);
router.get('/', requireAuth, getAnalyses);
router.get('/:id', requireAuth, getAnalysisById);

module.exports = router;
