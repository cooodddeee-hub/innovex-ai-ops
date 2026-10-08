const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  decisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Decision', required: true },
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  observedOutcome: { type: String, required: true },
  actualImpact: { type: String, required: true },
  estimatedVsActualMetrics: { type: Object, default: {} },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Outcome', outcomeSchema);
