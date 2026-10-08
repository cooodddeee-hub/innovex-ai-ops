const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  module: { type: String, required: true },
  problem: { type: String, required: true },
  evidence: { type: String, required: true },
  observedPattern: { type: String },
  prediction: { type: String },
  risk: { type: String },
  businessImpact: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  recommendedAction: { type: String, required: true },
  reason: { type: String },
  confidence: { type: String, default: '85%' },
  dataQuality: { type: String, default: 'High' },
  status: { 
    type: String, 
    enum: ['Generated', 'Reviewed', 'Accepted', 'Rejected', 'Action Taken', 'Outcome Recorded'], 
    default: 'Generated',
    index: true 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
