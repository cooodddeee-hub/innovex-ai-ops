const Analysis = require('../models/Analysis');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const getInventorySummary = async (req, res, next) => {
  try {
    let invAnalysis = null;
    if (getIsConnected()) {
      invAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'inventory', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      invAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'inventory' && a.hasSufficientData);
    }

    if (!invAnalysis) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: 'Insufficient data for Inventory & Demand intelligence. Upload an inventory dataset.'
      });
    }

    return res.json({
      success: true,
      hasSufficientData: true,
      results: invAnalysis.results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventorySummary };
