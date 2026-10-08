const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
