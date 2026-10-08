import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, Wrench, Package, DollarSign } from 'lucide-react';
import Badge from './Badge';

export default function AiDecisionTimeline({ timeline, machineId, status }) {
  const defaultTimeline = [
    { time: '14:02:10', event: 'Sensor Telemetry Ingested', detail: 'Vibration RMS 4.5 mm/s (+45.2%), Temp 88.1°C', icon: Clock, color: 'text-blue-500' },
    { time: '14:02:12', event: 'Data Quality Audited', detail: 'Data Quality Score 100/100 (Pass)', icon: ShieldCheck, color: 'text-emerald-500' },
    { time: '14:02:15', event: 'Hybrid Anomaly Score Calculated', detail: 'Combined Anomaly Score 87/100 (Z-Score + Isolation Forest)', icon: AlertTriangle, color: 'text-amber-500' },
    { time: '14:02:18', event: 'Failure Risk Assessed', detail: 'Failure Risk Estimate: 78.0% (Risk Estimate)', icon: AlertTriangle, color: 'text-rose-500' },
    { time: '14:02:22', event: 'RUL Forecast Generated', detail: 'Estimated RUL: 18 operating hours (14–24h range, 84% confidence)', icon: Clock, color: 'text-indigo-500' },
    { time: '14:02:25', event: 'Spare Part Readiness Verified', detail: 'Required: Bearing-6205 | Stock: 1 | Status: AT RISK', icon: Package, color: 'text-purple-500' },
    { time: '14:02:30', event: 'Financial Impact Calculated', detail: 'Total Estimated Financial Risk: $42,000 (Projected)', icon: DollarSign, color: 'text-emerald-600' },
    { time: '14:02:35', event: 'Work Order Created & Calendar Scheduled', detail: 'Work Order #WO-8901 sent to Maintenance Calendar', icon: Wrench, color: 'text-brand-600' }
  ];

  const list = (timeline && timeline.length > 0) ? timeline : defaultTimeline;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>AI Closed-Loop Decision Timeline ({machineId || 'CNC-04'})</span>
        </h3>
        <Badge variant={status === 'Healthy' ? 'success' : 'critical'}>
          {status || 'Critical Risk'}
        </Badge>
      </div>

      <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-brand-600" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{item.event}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                  {item.detail}
                </p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
