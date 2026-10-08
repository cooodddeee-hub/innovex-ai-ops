import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { Factory, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';

export default function ProductionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/production/material-consumption/summary');
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

  if (loading) return <LoadingState message="Calculating material consumption variances & cost leakage..." />;

  if (!data) {
    return (
      <EmptyState
        title="Insufficient data for Production Material Consumption analysis."
        message="Please upload a production dataset containing batch_id, material, standard_quantity, actual_quantity, and unit_cost."
        missingFields={['batch_id', 'material', 'standard_quantity', 'actual_quantity']}
      />
    );
  }

  const columns = [
    { header: 'Batch ID', accessor: 'batch_id' },
    { header: 'Product SKU', accessor: 'product' },
    { header: 'Raw Material', accessor: 'material' },
    { header: 'Std / Unit', accessor: 'standard_quantity_per_unit' },
    { header: 'Act / Unit', accessor: 'actual_quantity_per_unit' },
    { 
      header: 'Variance %', 
      render: (r) => (
        <span className={`font-semibold ${r.variance_percentage > 10 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
          {r.variance_percentage > 0 ? `+${r.variance_percentage}%` : `${r.variance_percentage}%`}
        </span>
      ) 
    },
    { header: 'Excess Material Cost', render: (r) => `$${r.excess_cost}` },
    { 
      header: 'Threshold Severity', 
      render: (r) => (
        <Badge variant={r.severity === 'Critical' ? 'critical' : (r.severity === 'High' ? 'warning' : 'info')}>
          {r.severity}
        </Badge>
      ) 
    },
    { header: 'Shift / Dept', render: (r) => `${r.shift} (${r.department})` }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Production Intelligence — Material Consumption Variance Monitor
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Formularized actual vs standard material consumption tracking, shift variance analysis, and excess cost leakage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Batches Analyzed" value={data.total_batches_analyzed} icon={Factory} badgeText="Batches" badgeColor="blue" />
        <KpiCard title="Overall Consumption Variance" value={`${data.overall_variance_percentage > 0 ? '+' : ''}${data.overall_variance_percentage}%`} icon={TrendingDown} badgeText={data.overall_variance_percentage > 5 ? 'Over-consumed' : 'Within Tolerance'} badgeColor={data.overall_variance_percentage > 5 ? 'amber' : 'green'} />
        <KpiCard title="Est. Excess Material Cost" value={`$${data.total_excess_cost?.toLocaleString() || '0'}`} icon={DollarSign} badgeText="Leakage" badgeColor="red" />
        <KpiCard title="High / Critical Variances" value={(data.alert_counts?.High || 0) + (data.alert_counts?.Critical || 0)} icon={AlertTriangle} badgeText="Action" badgeColor="red" />
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Batch Consumption Variance & Excess Cost Table
        </h2>
        <DataTable columns={columns} data={data.batches || []} />
      </div>
    </div>
  );
}
