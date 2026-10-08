const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  rowCount: { type: Number, default: 0 },
  columnCount: { type: Number, default: 0 },
  columns: [{ type: String }],
  detectedModule: { 
    type: String, 
    enum: ['inventory', 'maintenance', 'logistics', 'production', 'reflow', 'general'], 
    default: 'general' 
  },
  dataQualityScore: { type: Number, default: 100 },
  qualityReport: { type: Object, default: {} },
  recordsPreview: { type: Array, default: [] },
  status: { 
    type: String, 
    enum: ['Uploaded', 'Validating', 'Processing', 'Analyzed', 'Failed'], 
    default: 'Uploaded',
    index: true
  },
  isSample: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Dataset', datasetSchema);
