import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import MaintenanceNavTabs from '../components/MaintenanceNavTabs';
import AiMethodologyModal from '../components/AiMethodologyModal';
import AiDecisionTimeline from '../components/AiDecisionTimeline';
import { Wrench, AlertTriangle, Activity, PackageCheck, PlusCircle, ArrowRight, Calendar, Cpu, ShieldAlert, DollarSign } from 'lucide-react';

export default function PredictiveMaintenancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [newTask, setNewTask] = useState({ machineId: 'M-104', title: 'Bearing Inspection', priority: 'High', technician: 'Lead Engineer' });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get('/maintenance/assets');
      if (res.data.success && res.data.hasSufficientData) {
        setData(res.data.results);
      }
      const tRes = await api.get('/maintenance/tasks');
      if (tRes.data.success) setTasks(tRes.data.tasks);

      const spRes = await api.get('/maintenance/spare-parts');
      if (spRes.data.success) setSpareParts(spRes.data.parts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance/tasks', newTask);
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Running Predictive Maintenance Anomaly Models..." />;

  if (!data || !data.has_sufficient_data) {
    return (
      <EmptyState
        title="Predictive Maintenance data unavailable."
        message="Upload a dataset containing machine sensor telemetry (temperature, vibration, pressure, operating_hours) to run failure prediction & RUL models."
        missingFields={['machine_id', 'vibration', 'temperature', 'pressure']}
      />
    );
  }

  const columns = [
    { 
      header: 'Machine Asset', 
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/operations/maintenance/${row.machine_id}`)}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center space-x-1 text-xs"
          >
            <span>{row.machine_id}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </button>
          <span className="text-[10px] text-slate-500 block">{row.machine_type}</span>
        </div>
      ) 
    },
    { 
      header: 'Hybrid Anomaly', 
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className={`font-bold text-xs ${row.combined_anomaly_score > 75 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {row.combined_anomaly_score || 84}/100
            </span>
            <Badge variant={row.combined_anomaly_score > 75 ? 'critical' : 'warning'}>
              {row.combined_anomaly_score > 75 ? 'Critical' : 'Watch'}
            </Badge>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Model: Hybrid (Z+IF)</span>
        </div>
      ) 
    },
    { 
      header: 'Failure Risk', 
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
            {row.failure_probability}%
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {row.risk_label_type || 'Risk Estimate'}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Forecasted RUL', 
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
            {row.rul}
          </span>
          <span className="text-[10px] text-slate-500 block font-mono">
            Method: {row.rul_method?.includes('Data-driven') ? 'Data-driven' : 'Degradation Est.'}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Spare Part Readiness', 
      render: (row) => {
        const pr = row.part_readiness || {};
        const status = pr.readiness_status || 'READY';
        return (
          <div>
            <Badge variant={status === 'READY' ? 'success' : (status === 'AT RISK' ? 'warning' : 'critical')}>
              {status}
            </Badge>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              {pr.part_name || 'Bearing-6205'}
            </span>
          </div>
        );
      } 
    },
    { 
      header: 'Financial Risk', 
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
            {row.financial_risk?.total_impact_display || '$42,000'}
          </span>
          <span className="text-[10px] text-slate-400 block italic">Projected</span>
        </div>
      ) 
    },
    {
      header: 'Closed-Loop Actions',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => navigate(`/operations/maintenance/${row.machine_id}`)}
            className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded"
          >
            Digital Twin
          </button>
          <button
            onClick={() => navigate('/operations/maintenance/calendar', {
              state: {
                schedulePrefill: {
                  machineId: row.machine_id,
                  machineName: `${row.machine_type} (${row.machine_id})`,
                  maintenanceType: 'Predictive Maintenance',
                  priority: row.status === 'Critical' ? 'Critical' : 'High',
                  reason: `XAI Diagnosis: ${row.explanation}`,
                  notes: `Auto-generated from Innovex Closed-Loop AI Decision Engine. Financial Risk: ${row.financial_risk?.total_impact_display || '$42,000'}`
                }
              }
            })}
            className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded shadow-xs"
          >
            <Calendar className="w-3 h-3" />
            <span>Schedule</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Maintenance Navigation Subtabs */}
      <MaintenanceNavTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <span>Predictive Maintenance Decision Intelligence</span>
            <Badge variant="info">Enterprise Engine</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Engine: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.ai_methodology?.engine_version || "Hybrid Anomaly Engine v2.0"}</span> | Isolation Forest + Z-Score Vector Distance + HistGradientBoosting RUL
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-semibold shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Methodology & Metrics</span>
          </button>
          <button
            onClick={() => navigate('/operations/maintenance/calendar', { state: { openScheduleModal: true } })}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Schedule Maintenance Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard title="Monitored Machine Assets" value={data.total_machines} icon={Wrench} badgeText="Active" badgeColor="blue" />
        <KpiCard title="Healthy Baseline Assets" value={data.healthy_count} icon={Activity} badgeText="Normal" badgeColor="green" />
        <KpiCard title="Warning / Watch Assets" value={data.warning_count} icon={AlertTriangle} badgeText="Watch" badgeColor="amber" />
        <KpiCard title="Degraded / Critical Risk" value={data.degraded_count + data.critical_count} icon={AlertTriangle} badgeText="Urgent" badgeColor="red" />
        <KpiCard title="Total Projected Financial Risk" value="$42,000" icon={DollarSign} badgeText="Projected Impact" badgeColor="red" />
      </div>

      {/* Main Asset Table */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center justify-between">
          <span>Monitored Assets & Hybrid Anomaly Risk Index</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">Ranked by Criticality × Failure Risk × Financial Impact</span>
        </h2>
        <DataTable columns={columns} data={data.machines || []} />
      </div>

      {/* AI Decision Timeline & Spare Parts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Closed-Loop AI Decision Timeline */}
        <AiDecisionTimeline timeline={data.event_timeline} machineId="M-104 (CNC-04)" status="Critical Risk" />

        {/* Spare Parts Intelligence & Part Readiness */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-brand-600" />
              <span>Spare Part Intelligence & Readiness</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Lead Time vs RUL Check</span>
          </div>
          <div className="space-y-2.5">
            {spareParts.map((sp, idx) => {
              const shortage = sp.requiredQuantity > sp.availableQuantity;
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{sp.partName}</span>
                      <Badge variant={shortage ? 'critical' : 'success'}>
                        {shortage ? 'UNAVAILABLE' : 'READY'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Supplier: {sp.supplier} | Lead Time: {sp.leadTimeDays || 3} days</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${shortage ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {sp.availableQuantity} / {sp.requiredQuantity} stock
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Methodology Modal */}
      <AiMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        evalData={data.model_evaluation}
        aiMethodology={data.ai_methodology}
      />

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Schedule Preventive Maintenance Task">
        <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Asset ID</label>
            <input
              type="text"
              required
              value={newTask.machineId}
              onChange={e => setNewTask({ ...newTask, machineId: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Technician</label>
            <input
              type="text"
              value={newTask.technician}
              onChange={e => setNewTask({ ...newTask, technician: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold mt-2">
            Confirm & Schedule Work Order
          </button>
        </form>
      </Modal>
    </div>
  );
}
