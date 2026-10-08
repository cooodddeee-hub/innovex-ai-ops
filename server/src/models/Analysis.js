const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  module: { 
    type: String, 
    enum: ['inventory', 'maintenance', 'logistics', 'production', 'reflow', 'impact'], 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['Queued', 'Processing', 'Completed', 'Failed', 'Insufficient Data'], 
    default: 'Processing',
    index: true
  },
  results: { type: Object, default: {} },
  hasSufficientData: { type: Boolean, default: true },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
