const mongoose = require('mongoose');

const riskEventSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  module: { type: String, required: true },
  title: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
  riskScore: { type: Number, default: 50 },
  businessImpact: { type: String },
  confidence: { type: String, default: '85%' },
  evidence: { type: String },
  affectedEntity: { type: String },
  recommendedAction: { type: String },
  status: { type: String, enum: ['Active', 'Mitigated', 'Ignored'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskEvent', riskEventSchema);
