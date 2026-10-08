import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { RefreshCw, Clock, DollarSign, UserCheck } from 'lucide-react';

export default function ReflowPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reflow/summary');
        if (res.data.success && res.data.hasSufficientData) {
          setData(res.data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Analyzing workflow error patterns & rework hours..." />;

  if (!data) {
    return (
      <EmptyState
        title="Insufficient data for ReFlow AI process error analysis."
        message="Please upload a dataset containing transaction_id, process_type, department, error_type, rework_time, and cost."
        missingFields={['transaction_id', 'process_type', 'department', 'rework_time']}
      />
    );
  }

  const columns = [
    { header: 'TX ID', accessor: 'transaction_id' },
    { header: 'Process Step', accessor: 'process_type' },
    { header: 'Department', accessor: 'department' },
    { header: 'Observed Error Type', accessor: 'error_type' },
    { header: 'Rework Hours', render: (r) => `${r.rework_hours} hrs` },
    { header: 'Rework Cost Impact', render: (r) => `$${r.rework_cost}` },
    { 
      header: 'Customer Impacted', 
      render: (r) => (
        <Badge variant={r.customer_issue ? 'critical' : 'neutral'}>
          {r.customer_issue ? 'Yes' : 'Internal Only'}
        </Badge>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          ReFlow AI — Business Rework & Error Leakage Optimizer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Process error concentration, recurring rework bottlenecks, and evidence-based workflow validation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Transactions Analyzed" value={data.total_transactions} icon={RefreshCw} badgeText="Audited" badgeColor="blue" />
        <KpiCard title="Total Rework Hours" value={`${data.total_rework_hours} hrs`} icon={Clock} badgeText="Labor Time" badgeColor="amber" />
        <KpiCard title="Total Rework Cost" value={`$${data.total_rework_cost?.toLocaleString() || '0'}`} icon={DollarSign} badgeText="Cost Penalty" badgeColor="red" />
        <KpiCard title="Customer Impacted Incidents" value={data.customer_impacted_count} icon={UserCheck} badgeText="Satisfaction Risk" badgeColor="red" />
      </div>

      {/* Department Error Concentrations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
          Department-Level Process Error Concentrations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(data.department_summary || {}).map(([dept, stats], i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">{dept}</span>
              <div className="mt-1 flex justify-between text-slate-500">
                <span>{stats.error_count} incidents</span>
                <span>{stats.rework_hours} hrs rework</span>
              </div>
              <p className="mt-1 font-semibold text-rose-600 dark:text-rose-400">${stats.rework_cost} cost impact</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Audited Process Rework Transactions
        </h2>
        <DataTable columns={columns} data={data.transactions || []} />
      </div>
    </div>
  );
}
