const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  updateStatus,
  recordDecision,
  recordOutcome,
  getOutcomes
} = require('../controllers/recommendationController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, getRecommendations);
router.get('/outcomes', requireAuth, getOutcomes);
router.patch('/:id/status', requireAuth, requireRole('company_admin', 'manager', 'analyst'), updateStatus);
router.post('/:id/decision', requireAuth, requireRole('company_admin', 'manager', 'analyst'), recordDecision);
router.post('/:id/outcome', requireAuth, requireRole('company_admin', 'manager', 'analyst'), recordOutcome);

module.exports = router;
