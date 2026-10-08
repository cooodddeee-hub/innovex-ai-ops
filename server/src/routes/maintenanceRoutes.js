const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getSpareParts
} = require('../controllers/maintenanceController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/assets', requireAuth, getAssets);
router.get('/assets/:id', requireAuth, getAssetById);

// Task & Calendar endpoints
router.get('/tasks', requireAuth, getTasks);
router.get('/tasks/:id', requireAuth, getTaskById);
router.post('/tasks', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), createTask);
router.put('/tasks/:id', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), updateTask);
router.patch('/tasks/:id', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), updateTask);
router.delete('/tasks/:id', requireAuth, requireRole('company_admin', 'manager'), deleteTask);

router.get('/spare-parts', requireAuth, getSpareParts);

module.exports = router;
