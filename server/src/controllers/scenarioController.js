const Analysis = require('../models/Analysis');
const aiService = require('../services/aiService');
const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses } = require('./analysisController');

const runScenario = async (req, res, next) => {
  try {
    const { scenario_type, parameters } = req.body;
    const companyId = req.user.companyId;

    let maintAnalysis = null;
    if (getIsConnected()) {
      maintAnalysis = await Analysis.findOne({ companyId, module: scenario_type, hasSufficientData: true }).sort({ createdAt: -1 });
    } else {
      maintAnalysis = inMemoryAnalyses.find(a => String(a.companyId) === String(companyId) && a.module === scenario_type && a.hasSufficientData);
    }

    const baselineData = maintAnalysis ? maintAnalysis.results : { has_sufficient_data: false };

    const simulationResult = await aiService.analyzeScenario(scenario_type, parameters || {}, baselineData);
    return res.json({
      success: true,
      simulation: simulationResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runScenario };
