const Analysis = require('../models/Analysis');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const getProductionSummary = async (req, res, next) => {
  try {
    let prodAnalysis = null;
    if (getIsConnected()) {
      prodAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'production', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      prodAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'production' && a.hasSufficientData);
    }

    if (!prodAnalysis) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: 'Insufficient data for Production Material Consumption analysis. Upload a production dataset.'
      });
    }

    return res.json({
      success: true,
      hasSufficientData: true,
      results: prodAnalysis.results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProductionSummary };
