const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

const {
  uploadDataset,
  getDatasets,
  getDatasetById,
  deleteDataset,
  seedSampleDatasets
} = require('../controllers/datasetController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/upload', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), upload.single('file'), uploadDataset);
router.post('/seed-samples', requireAuth, seedSampleDatasets);
router.get('/', requireAuth, getDatasets);
router.get('/:id', requireAuth, getDatasetById);
router.delete('/:id', requireAuth, requireRole('company_admin', 'manager', 'analyst', 'operator'), deleteDataset);

module.exports = router;
