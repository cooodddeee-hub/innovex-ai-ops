import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ChevronRight, AlertCircle, ShieldAlert, Wrench, DollarSign } from 'lucide-react';

export default function HackathonDemoBar({ onSelectScenario, activeScenario }) {
  const scenarios = [
    { id: 1, label: '1. Healthy Baseline', description: 'Normal sensor operation across all assets' },
    { id: 2, label: '2. Bearing Degradation (CNC-04)', description: 'Vibration & thermal drift detected' },
    { id: 3, label: '3. Critical Failure Risk & RUL', description: 'High probability failure with 18h RUL' },
    { id: 4, label: '4. Spare Part Shortage', description: 'Part readiness alert: Lead time exceeds RUL' },
    { id: 5, label: '5. 24h Delay Financial Impact', description: 'Scenario simulator financial risk delta' }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-lg p-3.5 border border-slate-800 shadow-md space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            3-Minute Hackathon Demo Workflow Journey
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
            Functional Prototype
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click a demonstration scenario to execute deterministic end-to-end AI decision pipeline
        </span>
      </div>

      {/* Scenario Action Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectScenario(s.id)}
            className={`p-2 rounded text-left transition-colors border text-xs flex flex-col justify-between ${
              activeScenario === s.id
                ? 'bg-brand-600 text-white border-brand-400 shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center space-x-1">
              <Play className="w-3 h-3 text-amber-300 flex-shrink-0" />
              <span className="truncate">{s.label}</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Closed-Loop Pipeline Flow Diagram Bar */}
      <div className="pt-1 text-[11px] font-mono text-slate-300 overflow-x-auto flex items-center space-x-1 whitespace-nowrap">
        <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">1. SENSOR DATA</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">2. DATA QUALITY (100/100)</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">3. HYBRID ANOMALY (Z+IF)</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">4. FAILURE RISK</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">5. RUL (18h Forecast)</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">6. EXPLAINABLE AI (XAI)</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">7. SPARE PART READINESS</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-brand-400 border border-slate-700">8. MAINTENANCE CALENDAR</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">9. FINANCIAL RISK ($)</span>
      </div>
    </div>
  );
}
