const Analysis = require('../models/Analysis');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const getReflowSummary = async (req, res, next) => {
  try {
    let rfAnalysis = null;
    if (getIsConnected()) {
      rfAnalysis = await Analysis.findOne({ companyId: req.user.companyId, module: 'reflow', hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      rfAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(req.user.companyId) && a.module === 'reflow' && a.hasSufficientData);
    }

    if (!rfAnalysis) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: 'Insufficient data for ReFlow AI process error analysis. Upload a reflow errors dataset.'
      });
    }

    return res.json({
      success: true,
      hasSufficientData: true,
      results: rfAnalysis.results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReflowSummary };
