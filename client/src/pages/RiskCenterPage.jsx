import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { ShieldAlert, Filter } from 'lucide-react';

export default function RiskCenterPage() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await api.get('/risks');
        if (res.data.success) {
          setRisks(res.data.risks || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  if (loading) return <LoadingState message="Aggregating cross-functional operational risks..." />;

  const filteredRisks = risks.filter(r => {
    if (moduleFilter !== 'ALL' && r.module !== moduleFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    return true;
  });

  const columns = [
    { header: 'Module', accessor: 'module' },
    { header: 'Risk Title', accessor: 'title' },
    { header: 'Affected Entity', accessor: 'affectedEntity' },
    { 
      header: 'Severity', 
      render: (r) => (
        <Badge variant={r.severity === 'Critical' ? 'critical' : (r.severity === 'High' ? 'warning' : 'info')}>
          {r.severity}
        </Badge>
      ) 
    },
    { header: 'Risk Score', accessor: 'riskScore' },
    { header: 'Est. Impact', accessor: 'businessImpact' },
    { header: 'Evidence', accessor: 'evidence' },
    { header: 'Status', accessor: 'status' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Cross-Functional Risk Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unified operational risk matrix across Inventory, Predictive Maintenance, Logistics, Production, and ReFlow.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Modules</option>
              <option value="inventory">Inventory & Demand</option>
              <option value="maintenance">Predictive Maintenance</option>
              <option value="logistics">Logistics Optimization</option>
              <option value="production">Production Intelligence</option>
              <option value="reflow">ReFlow AI</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs">
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <DataTable columns={columns} data={filteredRisks} emptyMessage="No operational risks flagged matching current filter criteria." />
      </div>
    </div>
  );
}
