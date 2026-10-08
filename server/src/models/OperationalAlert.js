const mongoose = require('mongoose');

const operationalAlertSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  module: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  message: { type: String, required: true },
  entityId: { type: String },
  status: { type: String, enum: ['Active', 'Read', 'Resolved'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OperationalAlert', operationalAlertSchema);
