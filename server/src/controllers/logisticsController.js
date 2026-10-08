const Analysis = require('../models/Analysis');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const getLogisticsSummary = async (req, res, next) => {
  try {
    let logAnalysis = null;
    if (getIsConnected()) {
      logAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'logistics', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      logAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'logistics' && a.hasSufficientData);
    }

    if (!logAnalysis) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: 'Insufficient data for Logistics Optimization analysis. Upload a logistics dataset.'
      });
    }

    return res.json({
      success: true,
      hasSufficientData: true,
      results: logAnalysis.results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogisticsSummary };
