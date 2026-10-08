const Dataset = require('../models/Dataset');
const Analysis = require('../models/Analysis');
const Recommendation = require('../models/Recommendation');
const RiskEvent = require('../models/RiskEvent');
const OperationalAlert = require('../models/OperationalAlert');
const aiService = require('../services/aiService');
const { getIsConnected } = require('../config/db');
const { inMemoryDatasets } = require('./datasetController');
const { logAction } = require('../services/auditLogService');

const inMemoryAnalyses = [];
const inMemoryRecommendations = [];
const inMemoryRisks = [];
const inMemoryAlerts = [];

// POST /api/analysis/:datasetId
const runAnalysis = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    let dataset = null;
    let records = [];

    if (getIsConnected()) {
      dataset = await Dataset.findOne({ _id: datasetId, companyId: req.user.companyId });
      if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found.' });
      records = dataset.recordsPreview || [];
    } else {
      dataset = inMemoryDatasets.find(d => String(d._id) === String(datasetId) && String(d.companyId) === String(req.user.companyId));
      if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found.' });
      records = dataset.recordsFull || dataset.recordsPreview || [];
    }

    const moduleType = String(req.body.module || dataset.detectedModule || 'inventory').toLowerCase().trim();

    let aiResult;
    try {
      if (moduleType === 'inventory') {
        aiResult = await aiService.analyzeInventory(records);
      } else if (moduleType === 'maintenance') {
        aiResult = await aiService.analyzeMaintenance(records);
      } else if (moduleType === 'logistics') {
        aiResult = await aiService.analyzeLogistics(records);
      } else if (moduleType === 'production') {
        aiResult = await aiService.analyzeProduction(records);
      } else if (moduleType === 'reflow') {
        aiResult = await aiService.analyzeReflow(records);
      } else {
        return res.status(400).json({ success: false, message: `Unsupported module type: ${moduleType}` });
      }
    } catch (aiErr) {
      console.error('[AI Service Error]', aiErr.message);
      return res.status(503).json({
        success: false,
        message: 'AI Service error or unavailable. Verify Python FastAPI service is running on port 8000.',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    // Save Analysis record
    let analysisObj = {
      companyId: req.user.companyId,
      datasetId: dataset._id,
      module: moduleType,
      status: aiResult.has_sufficient_data ? 'Completed' : 'Insufficient Data',
      hasSufficientData: aiResult.has_sufficient_data,
      message: aiResult.message || aiResult.analysis_summary || '',
      results: aiResult,
      createdAt: new Date()
    };

    let savedAnalysis;
    if (getIsConnected()) {
      savedAnalysis = await Analysis.create(analysisObj);
      await Dataset.updateOne({ _id: dataset._id }, { status: 'Analyzed' });
    } else {
      analysisObj._id = 'analysis_' + Date.now();
      inMemoryAnalyses.push(analysisObj);
      dataset.status = 'Analyzed';
      savedAnalysis = analysisObj;
    }

    // Populate Recommendations, Risks, Alerts if sufficient data
    if (aiResult.has_sufficient_data && aiResult.recommendations) {
      for (const rec of aiResult.recommendations) {
        const recData = {
          companyId: req.user.companyId,
          datasetId: dataset._id,
          module: moduleType,
          problem: rec.problem,
          evidence: rec.evidence,
          observedPattern: rec.observed_pattern,
          prediction: rec.prediction,
          risk: rec.risk,
          businessImpact: rec.business_impact,
          priority: rec.priority || 'Medium',
          recommendedAction: rec.recommended_action,
          reason: rec.reason,
          confidence: rec.confidence || '85%',
          dataQuality: rec.data_quality || 'High',
          status: 'Generated',
          createdAt: new Date()
        };

        if (getIsConnected()) {
          await Recommendation.create(recData);
        } else {
          recData._id = 'rec_' + Date.now() + Math.random();
          inMemoryRecommendations.push(recData);
        }
      }
    }

    if (aiResult.has_sufficient_data && aiResult.risks) {
      for (const r of aiResult.risks) {
        const riskData = {
          companyId: req.user.companyId,
          module: moduleType,
          title: `${r.risk_type} - ${r.product || r.affectedAsset || 'Asset'}`,
          severity: r.severity || 'High',
          riskScore: r.severity === 'Critical' ? 90 : (r.severity === 'High' ? 75 : 50),
          businessImpact: r.potential_impact || r.businessImpact,
          evidence: r.evidence,
          affectedEntity: r.product || r.machine_id,
          recommendedAction: r.recommended_action,
          status: 'Active',
          createdAt: new Date()
        };

        if (getIsConnected()) {
          await RiskEvent.create(riskData);
        } else {
          riskData._id = 'risk_' + Date.now() + Math.random();
          inMemoryRisks.push(riskData);
        }
      }
    }

    if (aiResult.has_sufficient_data && aiResult.active_alerts) {
      for (const al of aiResult.active_alerts) {
        const alertData = {
          companyId: req.user.companyId,
          module: moduleType,
          severity: al.severity || 'High',
          message: al.message || `${al.material || al.machine_id} alert detected.`,
          entityId: al.machine_id || al.batch_id,
          status: 'Active',
          createdAt: new Date()
        };

        if (getIsConnected()) {
          await OperationalAlert.create(alertData);
        } else {
          alertData._id = 'alt_' + Date.now() + Math.random();
          inMemoryAlerts.push(alertData);
        }
      }
    }

    await logAction({
      companyId: req.user.companyId,
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'ANALYSIS_COMPLETED',
      details: { datasetId: dataset._id, module: moduleType, hasSufficientData: aiResult.has_sufficient_data }
    });

    return res.status(201).json({
      success: true,
      analysis: savedAnalysis,
      results: aiResult
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analysis
const getAnalyses = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const analyses = await Analysis.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
      return res.json({ success: true, analyses });
    } else {
      const analyses = inMemoryAnalyses.filter(a => String(a.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, analyses });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/analysis/:id
const getAnalysisById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const analysis = await Analysis.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!analysis) return res.status(404).json({ success: false, message: 'Analysis record not found.' });
      return res.json({ success: true, analysis });
    } else {
      const analysis = inMemoryAnalyses.find(a => String(a._id) === String(req.params.id) && String(a.companyId) === String(req.user.companyId));
      if (!analysis) return res.status(404).json({ success: false, message: 'Analysis record not found.' });
      return res.json({ success: true, analysis });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAnalysis,
  getAnalyses,
  getAnalysisById,
  inMemoryAnalyses,
  inMemoryRecommendations,
  inMemoryRisks,
  inMemoryAlerts
};
