import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { 
  Activity, 
  ShieldAlert, 
  Bell, 
  TrendingUp, 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Package,
  Wrench,
  Truck,
  Factory,
  RefreshCw,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleLoadSampleData = async () => {
    setSeeding(true);
    try {
      await api.post('/datasets/seed-samples');
      const dsRes = await api.get('/datasets');
      if (dsRes.data.datasets) {
        for (const ds of dsRes.data.datasets) {
          if (ds.isSample) {
            await api.post(`/analysis/${ds._id}`, { module: ds.detectedModule });
          }
        }
      }
      await fetchSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <LoadingState message="Connecting to Operational Command Center..." />;

  const kpis = summary?.kpis || {};
  const moduleHealth = summary?.moduleHealth || {};

  // Top Ranked Assets by Criticality x Failure Risk x Financial Impact
  const rankedAssets = [
    { id: 'M-104 (CNC-04)', type: 'Turbine Compressor', criticality: 'Critical', health: 25, anomalyScore: 91, failureRisk: '88.5%', RUL: '18 hrs', impact: '$42,000', action: 'Inspect bearing & apply ISO VG 220 lubricant' },
    { id: 'M-102 (Press-02)', type: 'Hydraulic Press', criticality: 'High', health: 42, anomalyScore: 84, failureRisk: '78.0%', RUL: '24 hrs', impact: '$27,000', action: 'Replace hydraulic filter cartridge' },
    { id: 'M-101 (CNC-01)', type: 'CNC Milling Machine', criticality: 'Medium', health: 74, anomalyScore: 45, failureRisk: '22.0%', RUL: '140 hrs', impact: '$9,500', action: 'Schedule routine spindle alignment' },
    { id: 'M-103 (Robot-01)', type: 'Robotic Assembly Arm', criticality: 'Low', health: 91, anomalyScore: 18, failureRisk: '4.5%', RUL: '420 hrs', impact: '$2,000', action: 'Routine joint calibration' }
  ];

  const aiActionItems = [
    { rank: 1, action: "Inspect CNC-04 bearing assembly & lubrication within 8h window", urgency: "Critical", asset: "M-104", impact: "$42,000 Risk Avoidance" },
    { rank: 2, action: "Expedite Bearing-6205 supplier order (Supplier lead time: 3 days)", urgency: "High", asset: "Spare Parts", impact: "Stockout Prevention" },
    { rank: 3, action: "Schedule preventive maintenance task for Press-02 in Maintenance Calendar", urgency: "High", asset: "M-102", impact: "$27,000 Downtime Risk" },
    { rank: 4, action: "Reorder hydraulic filter cartridge to maintain minimum reorder point", urgency: "Medium", asset: "Inventory", impact: "Working Capital Optimization" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Operations Command Center
            </h1>
            <Badge variant="info">Enterprise Edition</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-functional decision intelligence across inventory, predictive maintenance, logistics, production, and financial scenario simulation.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {kpis.totalDatasets === 0 && (
            <button
              onClick={handleLoadSampleData}
              disabled={seeding}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? 'Loading Sample Datasets...' : 'Load Sample Datasets'}</span>
            </button>
          )}
          <button
            onClick={() => navigate('/data/datasets')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-medium transition-colors"
          >
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Monitored Machine Assets"
          value="5 Active"
          subtext="Hybrid AI Anomaly Engine v2.0"
          icon={Activity}
          badgeText="Healthy Baseline"
          badgeColor="green"
        />
        <KpiCard
          title="Critical Risk Alerts"
          value={kpis.criticalRisks || 2}
          subtext="Action needed within RUL window"
          icon={ShieldAlert}
          badgeText="Action Needed"
          badgeColor="red"
        />
        <KpiCard
          title="Spare Parts At Risk"
          value="1 Shortage"
          subtext="Supplier lead time exceeds RUL"
          icon={Package}
          badgeText="Stock Alert"
          badgeColor="amber"
        />
        <KpiCard
          title="Projected Financial Risk"
          value="$42,000"
          subtext="Projected Downtime Loss Impact"
          icon={TrendingUp}
          badgeText="Projected Impact"
          badgeColor="red"
        />
        <KpiCard
          title="Pending Work Orders"
          value={kpis.pendingActions || 3}
          subtext="AI-generated maintenance orders"
          icon={CheckSquare}
          badgeText="Calendar Ready"
          badgeColor="blue"
        />
      </div>

      {/* AI Recommended Priority Action Items */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>AI Recommended Prescriptive Action Items</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Order by Financial Risk Reduction ($)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiActionItems.map((item) => (
            <div key={item.rank} className="p-3 bg-slate-800/80 rounded border border-slate-700 flex items-start space-x-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                {item.rank}
              </span>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100">{item.action}</span>
                  <Badge variant={item.urgency === 'Critical' ? 'critical' : 'warning'}>{item.urgency}</Badge>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  <span>Target: {item.asset}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{item.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Risk Ranking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Operational Risk Overview — Assets Ranked by (Criticality × Failure Risk × Financial Impact)
          </h3>
          <button
            onClick={() => navigate('/operations/maintenance')}
            className="text-xs text-brand-600 font-semibold hover:underline flex items-center space-x-1"
          >
            <span>Open Maintenance Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-2.5">Asset ID</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Criticality</th>
                <th className="p-2.5">Anomaly Score</th>
                <th className="p-2.5">Failure Risk</th>
                <th className="p-2.5">RUL Forecast</th>
                <th className="p-2.5">Projected Risk ($)</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{asset.id}</td>
                  <td className="p-2.5">{asset.type}</td>
                  <td className="p-2.5">
                    <Badge variant={asset.criticality === 'Critical' ? 'critical' : (asset.criticality === 'High' ? 'warning' : 'info')}>
                      {asset.criticality}
                    </Badge>
                  </td>
                  <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{asset.anomalyScore}/100</td>
                  <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{asset.failureRisk}</td>
                  <td className="p-2.5 font-mono">{asset.RUL}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{asset.impact}</td>
                  <td className="p-2.5">
                    <button
                      onClick={() => navigate('/operations/maintenance')}
                      className="px-2.5 py-1 text-[11px] bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded"
                    >
                      Execute Workflow
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
