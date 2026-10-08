const Analysis = require('../models/Analysis');
const aiService = require('../services/aiService');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const queryCopilot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required.' });
    }

    const companyId = req.user.companyId;

    let analyses = [];
    if (getIsConnected()) {
      analyses = await Analysis.find({ companyId, hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      analyses = inMemoryAnalyses.filter(a => String(a.companyId) === String(companyId) && a.hasSufficientData);
    }

    const companyContext = {};
    for (const a of analyses) {
      if (!companyContext[a.module]) {
        companyContext[a.module] = a.results;
      }
    }

    // Try computing latest business impact
    try {
      companyContext["impact"] = await aiService.analyzeImpact(companyContext);
    } catch (e) {
      companyContext["impact"] = {};
    }

    const copilotResponse = await aiService.queryCopilot(query, companyContext);
    return res.json({
      success: true,
      query,
      response: copilotResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { queryCopilot };
