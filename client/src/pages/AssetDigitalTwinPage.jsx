import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import AiDecisionTimeline from '../components/AiDecisionTimeline';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Wrench, ShieldAlert, Cpu, Activity, Clock, ArrowLeft, CheckCircle2, Calendar, Package } from 'lucide-react';

export default function AssetDigitalTwinPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/maintenance/assets/${id}`);
        if (res.data.success) {
          setAsset(res.data.asset);
          setSpareParts(res.data.spareParts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading) return <LoadingState message={`Fetching Digital Twin telemetry for machine ${id}...`} />;

  if (!asset) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-slate-500">Machine asset twin not found.</p>
        <button onClick={() => navigate('/operations/maintenance')} className="mt-3 text-xs text-brand-600 font-semibold">
          Return to Machine Assets List
        </button>
      </div>
    );
  }

  const sensorData = [
    { time: '08:00', vibration: 1.2, temp: 65, pressure: 100 },
    { time: '10:00', vibration: 2.1, temp: 72, pressure: 97 },
    { time: '12:00', vibration: 3.4, temp: 80, pressure: 94 },
    { time: '14:00', vibration: (asset.sensor_readings?.vibration || 4.5), temp: (asset.sensor_readings?.temperature || 88), pressure: (asset.sensor_readings?.pressure || 89) }
  ];

  const handleScheduleMaintenance = () => {
    navigate('/operations/maintenance/calendar', {
      state: {
        schedulePrefill: {
          machineId: asset.machine_id,
          machineName: `${asset.machine_type} (${asset.machine_id})`,
          maintenanceType: asset.status === 'Critical' ? 'Corrective Maintenance' : 'Predictive Maintenance',
          priority: asset.status === 'Critical' ? 'Critical' : (asset.status === 'Warning' ? 'High' : 'Medium'),
          reason: asset.explanation || `Digital Twin anomaly detection for ${asset.machine_id}`,
          notes: `Created directly from Machine Digital Twin Workbench.`
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Back button & title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/operations/maintenance')}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Machine Digital Twin Workbench: {asset.machine_id}
              </h1>
              <Badge variant={asset.status === 'Healthy' ? 'success' : (asset.status === 'Warning' ? 'warning' : 'critical')}>
                {asset.status}
              </Badge>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Simulated Telemetry Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type: {asset.machine_type} | Criticality: {asset.criticality} | Last Serviced: {asset.last_maintenance}
            </p>
          </div>
        </div>
        <button
          onClick={handleScheduleMaintenance}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Work Order</span>
        </button>
      </div>

      {/* Top Twin Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Asset Health Score</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{asset.health_score}/100</span>
            <span className={`text-xs font-semibold ${asset.health_score > 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {asset.health_score > 75 ? 'Optimal' : 'Deteriorating'}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Failure Risk Estimate</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{asset.failure_probability}%</span>
            <span className="text-xs text-slate-400">Risk Estimate</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Remaining Useful Life (RUL)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{asset.rul}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Hybrid Anomaly Score</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{asset.combined_anomaly_score || 87}/100</span>
            <span className="text-xs text-slate-400">Z + IF Engine</span>
          </div>
        </div>
      </div>

      {/* Explainable AI Block (WHY is this machine at risk?) */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Explainable AI (XAI) Diagnostic Insight — Root Cause Analysis</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            {asset.explanation}
          </p>
        </div>
        <button
          onClick={handleScheduleMaintenance}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold shadow-xs flex-shrink-0 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule Work Order</span>
        </button>
      </div>

      {/* Sensor Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Vibration Telemetry (mm/s RMS)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Simulated Telemetry Stream</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="vibration" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Thermal Baseline Trend (°C)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Simulated Telemetry Stream</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Decision Timeline */}
      <AiDecisionTimeline machineId={asset.machine_id} status={asset.status} />

      {/* Spare Parts Matching */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Required Maintenance Spare Parts & Inventory Matching
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spareParts.map((sp, i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
              <div>
                <span className="font-semibold">{sp.partName}</span>
                <p className="text-[11px] text-slate-500">Lead time: {sp.leadTimeDays} days | Supplier: {sp.supplier}</p>
              </div>
              <Badge variant={sp.availableQuantity < sp.requiredQuantity ? 'critical' : 'success'}>
                {sp.availableQuantity < sp.requiredQuantity ? 'UNAVAILABLE' : 'READY'} ({sp.availableQuantity} / {sp.requiredQuantity} in stock)
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
