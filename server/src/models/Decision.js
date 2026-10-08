const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  decision: { type: String, enum: ['Accepted', 'Rejected', 'Modified'], required: true },
  reason: { type: String },
  actionTaken: { type: String, required: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Decision', decisionSchema);
