import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import { Truck, Clock, DollarSign, ShieldAlert } from 'lucide-react';

export default function LogisticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/logistics/summary');
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

  if (loading) return <LoadingState message="Analyzing logistics routing & vehicle utilization..." />;

  if (!data) {
    return (
      <EmptyState
        title="Insufficient data for Logistics Optimization analysis."
        message="Please upload a logistics dataset with order_id, source, destination, distance, order_weight, and vehicle_id."
        missingFields={['order_id', 'source', 'destination', 'distance', 'vehicle_id']}
      />
    );
  }

  const columns = [
    { header: 'Order ID', accessor: 'order_id' },
    { header: 'Route', render: (r) => `${r.source} -> ${r.destination}` },
    { header: 'Distance', render: (r) => `${r.distance} km` },
    { header: 'Freight Cost', render: (r) => `$${r.cost}` },
    { header: 'Assigned Vehicle', accessor: 'vehicle_id' },
    { header: 'Vehicle Fill Rate', accessor: 'vehicle_utilization' },
    { header: 'Priority', accessor: 'priority' },
    { 
      header: 'Late Delivery Risk', 
      render: (r) => (
        <Badge variant={r.late_risk === 'High' ? 'critical' : 'success'}>
          {r.late_risk}
        </Badge>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Logistics & Dispatch Optimization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Freight consolidation, route efficiency, SLA deadline breach protection, and fleet utilization.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Shipments" value={data.total_orders} icon={Truck} badgeText="Orders" badgeColor="blue" />
        <KpiCard title="Total Transportation Cost" value={`$${data.total_cost?.toLocaleString() || '0'}`} icon={DollarSign} badgeText="Freight" badgeColor="blue" />
        <KpiCard title="Avg Cost / km" value={`$${data.average_cost_per_km}/km`} icon={DollarSign} badgeText="Rate" badgeColor="amber" />
        <KpiCard title="SLA Deadline Risks" value={data.late_delivery_risks?.length || 0} icon={ShieldAlert} badgeText="Action" badgeColor="red" />
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Active Freight Shipments & SLA Delivery Risks
        </h2>
        <DataTable columns={columns} data={data.orders || []} />
      </div>
    </div>
  );
}
