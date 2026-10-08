const RiskEvent = require('../models/RiskEvent');
const { getIsConnected } = require('../config/db');
const { inMemoryRisks } = require('./analysisController');

const getRisks = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const risks = await RiskEvent.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
      return res.json({ success: true, risks });
    } else {
      const risks = inMemoryRisks.filter(r => String(r.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, risks });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getRisks };
