const AuditLog = require('../models/AuditLog');
const { getIsConnected } = require('../config/db');

const inMemoryAuditLogs = [];

const logAction = async ({ companyId, userId, userEmail, action, details = {} }) => {
  try {
    if (getIsConnected()) {
      await AuditLog.create({
        companyId,
        userId,
        userEmail,
        action,
        details,
        timestamp: new Date()
      });
    } else {
      inMemoryAuditLogs.push({
        _id: 'audit_' + Date.now() + Math.random(),
        companyId,
        userId,
        userEmail,
        action,
        details,
        timestamp: new Date()
      });
    }
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

const getLogs = async (companyId) => {
  if (getIsConnected()) {
    return await AuditLog.find({ companyId }).sort({ timestamp: -1 }).limit(100);
  }
  return inMemoryAuditLogs.filter(l => String(l.companyId) === String(companyId)).reverse();
};

module.exports = { logAction, getLogs };
