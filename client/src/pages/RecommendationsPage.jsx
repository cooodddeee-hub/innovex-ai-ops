import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import { Lightbulb, CheckCircle, XCircle, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionForm, setDecisionForm] = useState({ decision: 'Accepted', reason: '', actionTaken: '' });
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleOpenDecision = (rec) => {
    setSelectedRec(rec);
    setDecisionForm({ decision: 'Accepted', reason: '', actionTaken: rec.recommendedAction });
    setDecisionModalOpen(true);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/recommendations/${selectedRec._id}/decision`, decisionForm);
      setDecisionModalOpen(false);
      fetchRecommendations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleFromRec = (rec) => {
    // Extract machine ID if mentioned in problem/evidence or default to M-101
    const machineMatch = (rec.problem + ' ' + rec.evidence).match(/M-\d{3}|CNC-\d{3}|ROBOT-\d{3}|CONVEYOR-\d{3}/i);
    const machineId = machineMatch ? machineMatch[0].toUpperCase() : 'MACHINE-001';

    navigate('/operations/maintenance/calendar', {
      state: {
        schedulePrefill: {
          machineId,
          machineName: `${rec.module || 'System'} (${machineId})`,
          maintenanceType: rec.priority === 'Critical' ? 'Corrective Maintenance' : 'Predictive Maintenance',
          priority: rec.priority || 'High',
          reason: rec.problem + ': ' + rec.recommendedAction,
          notes: `Generated from AI Recommendation engine. Evidence: ${rec.evidence}`
        }
      }
    });
  };

  if (loading) return <LoadingState message="Fetching AI-generated evidence-based recommendations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Evidence-Based Recommendation Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Structured 12-point decision matrix following Problem → Evidence → Observed Pattern → Prediction → Action → Business Impact.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <Badge variant={rec.priority === 'Critical' ? 'critical' : (rec.priority === 'High' ? 'warning' : 'info')}>
                    {rec.priority} Priority
                  </Badge>
                  <span className="text-xs font-bold text-slate-500 uppercase">{rec.module}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rec.problem}</h3>
                </div>
                <Badge variant={rec.status === 'Accepted' ? 'success' : (rec.status === 'Rejected' ? 'critical' : 'info')}>
                  {rec.status}
                </Badge>
              </div>

              {/* 12-Point Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">1. Evidence & Observed Pattern</span>
                  <p className="text-slate-600 dark:text-slate-400">{rec.evidence}</p>
                  {rec.observedPattern && <p className="text-slate-500 italic mt-1">{rec.observedPattern}</p>}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">2. Prediction & Risk</span>
                  <p className="text-slate-600 dark:text-slate-400">{rec.prediction || 'Risk trajectory elevated.'}</p>
                  <p className="text-rose-600 font-semibold">{rec.risk}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">3. Business Impact</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{rec.businessImpact}</p>
                  <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-500">
                    <span>Confidence: {rec.confidence}</span>
                    <span>•</span>
                    <span>Quality: {rec.dataQuality}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Bar */}
              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-brand-700 dark:text-brand-300">Recommended Action:</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{rec.recommendedAction}</p>
                  {rec.reason && <p className="text-slate-500 text-[11px] mt-0.5">Reason: {rec.reason}</p>}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleScheduleFromRec(rec)}
                    className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold shadow-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Maintenance</span>
                  </button>
                  {rec.status === 'Generated' || rec.status === 'Reviewed' ? (
                    <button
                      onClick={() => handleOpenDecision(rec)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold shadow-xs transition-colors"
                    >
                      Record Decision
                    </button>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center space-x-1 px-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Decision Recorded</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-xs text-slate-500">No active AI recommendations generated yet.</p>
          </div>
        )}
      </div>

      {/* Decision Record Modal */}
      <Modal isOpen={decisionModalOpen} onClose={() => setDecisionModalOpen(false)} title="Record Operational Decision">
        <form onSubmit={handleSubmitDecision} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Decision</label>
            <select
              value={decisionForm.decision}
              onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="Accepted">Accept Recommendation</option>
              <option value="Rejected">Reject Recommendation</option>
              <option value="Modified">Accept with Modification</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Action to Executed</label>
            <textarea
              rows={2}
              required
              value={decisionForm.actionTaken}
              onChange={e => setDecisionForm({ ...decisionForm, actionTaken: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Manager Justification / Reason</label>
            <input
              type="text"
              placeholder="e.g. Approved preventive maintenance order during upcoming shift window."
              value={decisionForm.reason}
              onChange={e => setDecisionForm({ ...decisionForm, reason: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold mt-2">
            Submit Decision & Update Lifecycle
          </button>
        </form>
      </Modal>
    </div>
  );
}
