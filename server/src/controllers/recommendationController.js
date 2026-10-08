const Recommendation = require('../models/Recommendation');
const Decision = require('../models/Decision');
const Outcome = require('../models/Outcome');
const { getIsConnected } = require('../config/db');
const { inMemoryRecommendations } = require('./analysisController');
const { logAction } = require('../services/auditLogService');

const inMemoryDecisions = [];
const inMemoryOutcomes = [];

// GET /api/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const recommendations = await Recommendation.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
      return res.json({ success: true, recommendations });
    } else {
      const recommendations = inMemoryRecommendations.filter(r => String(r.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, recommendations });
    }
  } catch (error) {
    next(error);
  }
};

// PATCH /api/recommendations/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (getIsConnected()) {
      const rec = await Recommendation.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user.companyId },
        { status, reviewedBy: req.user._id },
        { new: true }
      );
      if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found.' });
      return res.json({ success: true, recommendation: rec });
    } else {
      const rec = inMemoryRecommendations.find(r => String(r._id) === String(req.params.id) && String(r.companyId) === String(req.user.companyId));
      if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found.' });
      rec.status = status;
      return res.json({ success: true, recommendation: rec });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/recommendations/:id/decision
const recordDecision = async (req, res, next) => {
  try {
    const { decision, reason, actionTaken } = req.body;
    const recId = req.params.id;

    const decObj = {
      companyId: req.user.companyId,
      recommendationId: recId,
      decision,
      reason: reason || '',
      actionTaken,
      decidedBy: req.user._id || req.user.id,
      createdAt: new Date()
    };

    let savedDecision;
    if (getIsConnected()) {
      savedDecision = await Decision.create(decObj);
      await Recommendation.updateOne({ _id: recId }, { status: decision === 'Accepted' ? 'Accepted' : 'Rejected' });
    } else {
      decObj._id = 'dec_' + Date.now();
      inMemoryDecisions.push(decObj);
      savedDecision = decObj;
      const rec = inMemoryRecommendations.find(r => String(r._id) === String(recId));
      if (rec) rec.status = decision === 'Accepted' ? 'Accepted' : 'Rejected';
    }

    await logAction({
      companyId: req.user.companyId,
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'DECISION_RECORDED',
      details: { recommendationId: recId, decision, actionTaken }
    });

    return res.status(201).json({ success: true, decision: savedDecision });
  } catch (error) {
    next(error);
  }
};

// POST /api/recommendations/:id/outcome
const recordOutcome = async (req, res, next) => {
  try {
    const { decisionId, observedOutcome, actualImpact, estimatedVsActualMetrics } = req.body;
    const recId = req.params.id;

    const outObj = {
      companyId: req.user.companyId,
      decisionId,
      recommendationId: recId,
      observedOutcome,
      actualImpact,
      estimatedVsActualMetrics: estimatedVsActualMetrics || {},
      recordedBy: req.user._id || req.user.id,
      createdAt: new Date()
    };

    let savedOutcome;
    if (getIsConnected()) {
      savedOutcome = await Outcome.create(outObj);
      await Recommendation.updateOne({ _id: recId }, { status: 'Outcome Recorded' });
    } else {
      outObj._id = 'out_' + Date.now();
      inMemoryOutcomes.push(outObj);
      savedOutcome = outObj;
      const rec = inMemoryRecommendations.find(r => String(r._id) === String(recId));
      if (rec) rec.status = 'Outcome Recorded';
    }

    await logAction({
      companyId: req.user.companyId,
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'OUTCOME_RECORDED',
      details: { recommendationId: recId, observedOutcome, actualImpact }
    });

    return res.status(201).json({ success: true, outcome: savedOutcome });
  } catch (error) {
    next(error);
  }
};

// GET /api/recommendations/outcomes
const getOutcomes = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const outcomes = await Outcome.find({ companyId: req.user.companyId }).populate('recommendationId').sort({ createdAt: -1 });
      return res.json({ success: true, outcomes });
    } else {
      const outcomes = inMemoryOutcomes.filter(o => String(o.companyId) === String(req.user.companyId)).reverse();
      return res.json({ success: true, outcomes });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  updateStatus,
  recordDecision,
  recordOutcome,
  getOutcomes
};
