import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DecisionOutcomesPage() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        const res = await api.get('/recommendations/outcomes');
        if (res.data.success) {
          setOutcomes(res.data.outcomes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutcomes();
  }, []);

  if (loading) return <LoadingState message="Fetching decision and outcome audit trail..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          <span>Decision & Outcome Tracking Log</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Empirical comparison between AI predicted business impact and observed real-world outcomes.
        </p>
      </div>

      <div className="space-y-3">
        {outcomes.length > 0 ? (
          outcomes.map((out, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Outcome Entry #{idx + 1}</span>
                <Badge variant="success">Outcome Recorded</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Observed Outcome</span>
                  <p>{out.observedOutcome}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Actual Financial / Operational Impact</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{out.actualImpact}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No decisions or outcomes recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Review pending recommendations to accept actions and record observed outcomes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
