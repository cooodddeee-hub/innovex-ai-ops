const Analysis = require('../models/Analysis');
const RiskEvent = require('../models/RiskEvent');
const Recommendation = require('../models/Recommendation');
const OperationalAlert = require('../models/OperationalAlert');
const Dataset = require('../models/Dataset');

const { getIsConnected } = require('../config/db');
const { inMemoryAnalyses, inMemoryRecommendations, inMemoryRisks, inMemoryAlerts } = require('./analysisController');
const { inMemoryDatasets } = require('./datasetController');
const aiService = require('../services/aiService');

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    let analyses = [];
    let risks = [];
    let recommendations = [];
    let alerts = [];
    let datasets = [];

    if (getIsConnected()) {
      analyses = await Analysis.find({ companyId }).sort({ createdAt: -1 });
      risks = await RiskEvent.find({ companyId, status: 'Active' });
      recommendations = await Recommendation.find({ companyId });
      alerts = await OperationalAlert.find({ companyId, status: 'Active' });
      datasets = await Dataset.find({ companyId });
    } else {
      analyses = inMemoryAnalyses.filter(a => String(a.companyId) === String(companyId));
      risks = inMemoryRisks.filter(r => String(r.companyId) === String(companyId) && r.status === 'Active');
      recommendations = inMemoryRecommendations.filter(r => String(r.companyId) === String(companyId));
      alerts = inMemoryAlerts.filter(a => String(a.companyId) === String(companyId) && a.status === 'Active');
      datasets = inMemoryDatasets.filter(d => String(d.companyId) === String(companyId));
    }

    // Extract latest module results
    const moduleResults = {};
    for (const a of analyses) {
      if (!moduleResults[a.module] && a.hasSufficientData) {
        moduleResults[a.module] = a.results;
      }
    }

    // Run unified business impact calculation
    let impactData = { impact_score: 15, impact_level: 'Low', financial_impact_display: '$0.00' };
    try {
      impactData = await aiService.analyzeImpact(moduleResults);
    } catch (err) {
      console.warn('[Dashboard Impact Error]', err.message);
    }

    const criticalRisksCount = risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
    const pendingActionsCount = recommendations.filter(r => r.status === 'Generated' || r.status === 'Reviewed').length;
    
    // Operational Health score derived from average machine/inventory health
    let operationalHealth = 92;
    if (moduleResults.maintenance && moduleResults.maintenance.machines) {
      const scores = moduleResults.maintenance.machines.map(m => m.health_score);
      if (scores.length > 0) {
        operationalHealth = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }

    return res.json({
      success: true,
      kpis: {
        operationalHealth: { score: operationalHealth, status: operationalHealth > 75 ? 'Healthy' : 'Warning' },
        criticalRisks: criticalRisksCount,
        activeAlerts: alerts.length,
        estimatedBusinessImpact: impactData.financial_impact_display || '$0.00',
        impactScore: impactData.impact_score || 0,
        pendingActions: pendingActionsCount,
        totalDatasets: datasets.length
      },
      recentAnalyses: analyses.slice(0, 5),
      recentAlerts: alerts.slice(0, 5),
      topRecommendations: recommendations.filter(r => r.status !== 'Rejected' && r.status !== 'Outcome Recorded').slice(0, 5),
      moduleHealth: {
        inventory: moduleResults.inventory ? (moduleResults.inventory.stockout_risk_count > 0 ? 'Warning' : 'Healthy') : 'No Data',
        maintenance: moduleResults.maintenance ? (moduleResults.maintenance.critical_count > 0 ? 'Critical' : (moduleResults.maintenance.warning_count > 0 ? 'Warning' : 'Healthy')) : 'No Data',
        logistics: moduleResults.logistics ? (moduleResults.logistics.late_delivery_risks.length > 0 ? 'Warning' : 'Healthy') : 'No Data',
        production: moduleResults.production ? (moduleResults.production.total_excess_cost > 1000 ? 'Warning' : 'Healthy') : 'No Data',
        reflow: moduleResults.reflow ? (moduleResults.reflow.total_rework_hours > 10 ? 'Warning' : 'Healthy') : 'No Data'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
