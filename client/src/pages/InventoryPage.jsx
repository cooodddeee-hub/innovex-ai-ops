import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { Package, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

export default function InventoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/inventory/summary');
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

  if (loading) return <LoadingState message="Analyzing inventory trajectories & demand forecasts..." />;

  if (!data) {
    return (
      <EmptyState
        title="Insufficient data for Inventory & Demand analysis."
        message="Please upload a dataset containing inventory, sales/demand, lead_time, and unit_cost fields."
        missingFields={['product', 'inventory', 'demand', 'lead_time']}
      />
    );
  }

  const columns = [
    { header: 'Product Name', accessor: 'product' },
    { header: 'Avg Daily Demand', accessor: 'average_demand' },
    { header: 'Current Stock', accessor: 'current_inventory' },
    { 
      header: 'Days of Supply', 
      render: (r) => (
        <span className={`font-semibold ${r.stockout_risk === 'High' ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
          {r.days_of_supply} days
        </span>
      ) 
    },
    { header: 'Reorder Level', accessor: 'reorder_level' },
    { 
      header: 'Stockout Risk', 
      render: (r) => (
        <Badge variant={r.stockout_risk === 'High' ? 'critical' : (r.stockout_risk === 'Medium' ? 'warning' : 'success')}>
          {r.stockout_risk}
        </Badge>
      ) 
    },
    { 
      header: 'Excess Stock Risk', 
      render: (r) => (
        <Badge variant={r.excess_risk === 'High' ? 'warning' : 'neutral'}>
          {r.excess_risk}
        </Badge>
      ) 
    },
    { header: 'Supplier', accessor: 'supplier' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Inventory & Demand Intelligence
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Data-driven stockout prevention, reorder optimization, and supplier concentration risk analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Products Analyzed" value={data.total_products_analyzed} icon={Package} badgeText="Catalog" badgeColor="blue" />
        <KpiCard title="Stockout Risk Items" value={data.stockout_risk_count} icon={AlertTriangle} badgeText="Action Required" badgeColor="red" />
        <KpiCard title="Excess Inventory Items" value={data.excess_inventory_count} icon={TrendingUp} badgeText="Capital Tied" badgeColor="amber" />
        <KpiCard title="Est. Financial Exposure" value={`$${data.total_estimated_impact?.toLocaleString() || '0'}`} icon={ShieldAlert} badgeText="Calculated" badgeColor="red" />
      </div>

      {/* Main Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          SKU Inventory Trajectories & Replenishment Signals
        </h2>
        <DataTable columns={columns} data={data.products || []} />
      </div>
    </div>
  );
}
