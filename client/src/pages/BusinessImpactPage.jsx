import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { TrendingUp, ShieldAlert, DollarSign, Activity } from 'lucide-react';

export default function BusinessImpactPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.data.success) {
          setSummary(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingState message="Calculating unified business impact across enterprise modules..." />;

  const kpis = summary?.kpis || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          <span>Unified Business Impact Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Consolidated enterprise financial exposure, downtime risks, and cost leakage evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Consolidated Financial Impact" value={kpis.estimatedBusinessImpact || '$0.00'} subtext="Summed potential financial risk across active modules" icon={DollarSign} badgeText="Projected" badgeColor="red" />
        <KpiCard title="Impact Score Index" value={`${kpis.impactScore || 0}/100`} subtext="Normalized cross-functional risk score" icon={Activity} badgeText={kpis.impactScore > 50 ? 'Elevated' : 'Moderate'} badgeColor={kpis.impactScore > 50 ? 'amber' : 'green'} />
        <KpiCard title="Pending Action Count" value={kpis.pendingActions || 0} subtext="Recommendations requiring intervention" icon={ShieldAlert} badgeText="Review" badgeColor="blue" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Financial Impact Language & Calculation Rules
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The Business Impact Engine enforces strict data-first rules. Financial impact estimations are calculated strictly when verified unit costs, downtime rates, or order values are present in company uploaded datasets. Where financial figures are absent, the system explicitly reports: <span className="font-semibold italic text-slate-700 dark:text-slate-300">"Financial impact unavailable because unit cost/cost data is not available."</span>
        </p>
      </div>
    </div>
  );
}
