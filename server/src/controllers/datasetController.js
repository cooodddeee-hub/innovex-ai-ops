const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');

const Dataset = require('../models/Dataset');
const { evaluateDataQuality } = require('../services/dataQualityEngine');
const { logAction } = require('../services/auditLogService');
const { getIsConnected } = require('../config/db');

const inMemoryDatasets = [];

// Helper: parse file content into records & columns
function parseFileBuffer(buffer, fileExtension) {
  let records = [];
  let columns = [];

  if (fileExtension === '.csv' || fileExtension === '.txt') {
    const csvContent = buffer.toString('utf-8');
    const parsed = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    records = parsed;
    columns = records.length > 0 ? Object.keys(records[0]) : [];
  } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    records = xlsx.utils.sheet_to_json(sheet);
    columns = records.length > 0 ? Object.keys(records[0]) : [];
  }

  return { records, columns };
}

// POST /api/datasets/upload
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a CSV or Excel spreadsheet.',
        code: 'MISSING_FILE'
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Only CSV, XLSX, and XLS files are supported.',
        code: 'INVALID_FORMAT'
      });
    }

    const { records, columns } = parseFileBuffer(req.file.buffer, fileExt);
    const qualityReport = evaluateDataQuality(records, columns);

    const isSample = req.body.isSample === 'true' || req.body.isSample === true;

    let datasetObj = {
      companyId: req.user.companyId,
      filename: req.file.filename || req.file.originalname,
      originalName: req.file.originalname,
      fileType: fileExt.substring(1).toUpperCase(),
      fileSize: req.file.size,
      rowCount: records.length,
      columnCount: columns.length,
      columns,
      detectedModule: qualityReport.detectedModule,
      dataQualityScore: qualityReport.dataQualityScore,
      qualityReport,
      recordsPreview: records.slice(0, 100), // Preview first 100 rows
      status: 'Uploaded',
      isSample,
      uploadedBy: req.user._id || req.user.id,
      createdAt: new Date()
    };

    if (getIsConnected()) {
      const savedDataset = await Dataset.create(datasetObj);
      await logAction({
        companyId: req.user.companyId,
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'DATASET_UPLOADED',
        details: { filename: req.file.originalname, detectedModule: qualityReport.detectedModule, rowCount: records.length }
      });
      return res.status(201).json({ success: true, dataset: savedDataset, recordsCount: records.length });
    } else {
      datasetObj._id = 'ds_' + Date.now();
      datasetObj.recordsFull = records; // store full records in memory
      inMemoryDatasets.push(datasetObj);
      return res.status(201).json({ success: true, dataset: datasetObj, recordsCount: records.length });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/datasets
const getDatasets = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const datasets = await Dataset.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
      return res.json({ success: true, datasets });
    } else {
      const datasets = inMemoryDatasets.filter(d => String(d.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, datasets });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/datasets/:id
const getDatasetById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const dataset = await Dataset.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found.' });
      return res.json({ success: true, dataset });
    } else {
      const dataset = inMemoryDatasets.find(d => String(d._id) === String(req.params.id) && String(d.companyId) === String(req.user.companyId));
      if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found.' });
      return res.json({ success: true, dataset });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/datasets/:id
const deleteDataset = async (req, res, next) => {
  try {
    const datasetId = req.params.id;
    const companyId = req.user.companyId;
    const mongoose = require('mongoose');
    const Analysis = require('../models/Analysis');
    const Recommendation = require('../models/Recommendation');
    const RiskEvent = require('../models/RiskEvent');
    const OperationalAlert = require('../models/OperationalAlert');
    const { inMemoryAnalyses, inMemoryRecommendations, inMemoryRisks, inMemoryAlerts } = require('./analysisController');

    let deletedDataset = null;

    if (getIsConnected()) {
      let filter = { companyId };
      if (mongoose.Types.ObjectId.isValid(datasetId)) {
        filter._id = datasetId;
      } else {
        filter.$or = [{ _id: datasetId }, { filename: datasetId }, { originalName: datasetId }];
      }

      deletedDataset = await Dataset.findOneAndDelete(filter);

      if (!deletedDataset && mongoose.Types.ObjectId.isValid(datasetId)) {
        deletedDataset = await Dataset.findByIdAndDelete(datasetId).catch(() => null);
      }

      if (deletedDataset) {
        // Clean up child records in DB
        await Analysis.deleteMany({ datasetId: deletedDataset._id }).catch(() => {});
        await Recommendation.deleteMany({ datasetId: deletedDataset._id }).catch(() => {});
        await RiskEvent.deleteMany({ datasetId: deletedDataset._id }).catch(() => {});
        await OperationalAlert.deleteMany({ datasetId: deletedDataset._id }).catch(() => {});

        // Clean up file on disk if stored
        if (deletedDataset.filePath && fs.existsSync(deletedDataset.filePath)) {
          try { fs.unlinkSync(deletedDataset.filePath); } catch (e) {}
        }

        await logAction({
          companyId,
          userId: req.user._id,
          userEmail: req.user.email,
          action: 'DATASET_DELETED',
          details: { datasetId: deletedDataset._id, filename: deletedDataset.filename }
        });
      } else {
        return res.status(404).json({ success: false, message: 'Dataset not found or already deleted.', code: 'NOT_FOUND' });
      }
    } else {
      // In-Memory Fallback Deletion
      const idx = inMemoryDatasets.findIndex(d => 
        String(d._id) === String(datasetId) || 
        String(d.filename) === String(datasetId) ||
        String(d.originalName) === String(datasetId)
      );

      if (idx !== -1) {
        deletedDataset = inMemoryDatasets[idx];
        inMemoryDatasets.splice(idx, 1);

        // Clean up in-memory child records
        const targetIdStr = String(deletedDataset._id);
        for (let i = inMemoryAnalyses.length - 1; i >= 0; i--) {
          if (String(inMemoryAnalyses[i].datasetId) === targetIdStr) inMemoryAnalyses.splice(i, 1);
        }
        for (let i = inMemoryRecommendations.length - 1; i >= 0; i--) {
          if (String(inMemoryRecommendations[i].datasetId) === targetIdStr) inMemoryRecommendations.splice(i, 1);
        }
        for (let i = inMemoryRisks.length - 1; i >= 0; i--) {
          if (String(inMemoryRisks[i].datasetId) === targetIdStr) inMemoryRisks.splice(i, 1);
        }
        for (let i = inMemoryAlerts.length - 1; i >= 0; i--) {
          if (String(inMemoryAlerts[i].datasetId) === targetIdStr) inMemoryAlerts.splice(i, 1);
        }
      } else {
        return res.status(404).json({ success: false, message: 'Dataset not found or already deleted.', code: 'NOT_FOUND' });
      }
    }

    return res.json({
      success: true,
      message: 'Dataset deleted successfully.',
      datasetId: deletedDataset ? deletedDataset._id : datasetId
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/datasets/seed-samples
const seedSampleDatasets = async (req, res, next) => {
  try {
    const sampleDir = path.join(__dirname, '../../../sample-data');
    const sampleFiles = [
      { name: 'inventory_demand.csv', module: 'inventory' },
      { name: 'machine_maintenance.csv', module: 'maintenance' },
      { name: 'logistics.csv', module: 'logistics' },
      { name: 'reflow_errors.csv', module: 'reflow' },
      { name: 'production_material_consumption.csv', module: 'production' }
    ];

    const seeded = [];

    for (const sf of sampleFiles) {
      const filePath = path.join(sampleDir, sf.name);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const { records, columns } = parseFileBuffer(buffer, '.csv');
        const qualityReport = evaluateDataQuality(records, columns);

        let datasetObj = {
          companyId: req.user.companyId,
          filename: sf.name,
          originalName: sf.name,
          fileType: 'CSV',
          fileSize: buffer.length,
          rowCount: records.length,
          columnCount: columns.length,
          columns,
          detectedModule: sf.module,
          dataQualityScore: qualityReport.dataQualityScore,
          qualityReport,
          recordsPreview: records,
          recordsFull: records,
          status: 'Uploaded',
          isSample: true,
          uploadedBy: req.user._id || req.user.id,
          createdAt: new Date()
        };

        if (getIsConnected()) {
          const saved = await Dataset.create(datasetObj);
          seeded.push(saved);
        } else {
          datasetObj._id = 'ds_sample_' + sf.module + '_' + Date.now();
          inMemoryDatasets.push(datasetObj);
          seeded.push(datasetObj);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: `Loaded ${seeded.length} sample operational datasets.`,
      datasets: seeded
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDataset,
  getDatasets,
  getDatasetById,
  deleteDataset,
  seedSampleDatasets,
  inMemoryDatasets
};
