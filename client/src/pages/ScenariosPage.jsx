import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { Sliders, Play, Sparkles, ArrowRight, TrendingUp, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ScenariosPage() {
  const [scenarioType, setScenarioType] = useState('maintenance');
  const [delayHours, setDelayHours] = useState(24);
  const [procurementIncrease, setProcurementIncrease] = useState(20);
  const [varianceReduction, setVarianceReduction] = useState(10);
  const [reworkReduction, setReworkReduction] = useState(20);

  const [simulationResult, setSimulationResult] = useState({
    is_simulation: true,
    scenario_type: 'maintenance',
    baseline_summary: {
      critical_degraded_assets: 2,
      projected_failure_risk: 'Current State (RUL 18h)'
    },
    simulated_summary: {
      critical_degraded_assets: 4,
      delay_hours: 24,
      simulated_downtime_cost_impact: '$36,000.00'
    },
    delta: {
      additional_high_risk_assets: 2,
      risk_elevation_percentage: '+100.0%',
      estimated_financial_delta: '+$18,400.00'
    },
    recommendation: 'Delaying maintenance by 24 hours elevates machine failure probability to 88.5% and incurs an estimated $18,400 financial risk delta. Recommended Action: Schedule maintenance work order immediately within 8h window.'
  });
  
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const handleRunSimulation = async () => {
    setRunning(true);
    let params = {};
    if (scenarioType === 'maintenance') params = { delay_hours: delayHours };
    else if (scenarioType === 'inventory') params = { procurement_increase_pct: procurementIncrease };
    else if (scenarioType === 'production') params = { variance_reduction_pct: varianceReduction };
    else if (scenarioType === 'reflow') params = { rework_reduction_pct: reworkReduction };

    try {
      const res = await api.post('/scenarios/simulate', {
        scenario_type: scenarioType,
        parameters: params
      });
      if (res.data.success) {
        setSimulationResult(res.data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-brand-600" />
          <span>What-If Financial Risk & Scenario Simulation Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Simulate operational decisions before execution. All metrics are mathematical projections clearly labeled as SIMULATION.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Simulation Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Operational Module</label>
            <select
              value={scenarioType}
              onChange={e => {
                setScenarioType(e.target.value);
              }}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="maintenance">Predictive Maintenance Delay</option>
              <option value="inventory">Inventory Procurement Increase</option>
              <option value="production">Material Consumption Variance Reduction</option>
              <option value="reflow">ReFlow Rework Reduction</option>
            </select>
          </div>

          {/* Dynamic Slider Controls */}
          {scenarioType === 'maintenance' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Maintenance Delay Window</label>
                <span className="font-bold text-brand-600">{delayHours} Hours</span>
              </div>
              <input
                type="range"
                min="6"
                max="72"
                step="6"
                value={delayHours}
                onChange={e => setDelayHours(Number(e.target.value))}
                className="w-fullaccent-brand-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Simulates failure probability escalation if work order is delayed by {delayHours}h.</p>
            </div>
          )}

          {scenarioType === 'inventory' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Procurement Increase %</label>
                <span className="font-bold text-brand-600">+{procurementIncrease}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={procurementIncrease}
                onChange={e => setProcurementIncrease(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Simulates stockout reduction vs working capital requirements.</p>
            </div>
          )}

          {scenarioType === 'production' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Material Variance Target Reduction %</label>
                <span className="font-bold text-brand-600">-{varianceReduction}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={varianceReduction}
                onChange={e => setVarianceReduction(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Simulates direct material cost recovery from machinery calibration.</p>
            </div>
          )}

          {scenarioType === 'reflow' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <label className="text-slate-700 dark:text-slate-300">Rework Target Reduction %</label>
                <span className="font-bold text-brand-600">-{reworkReduction}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={reworkReduction}
                onChange={e => setReworkReduction(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Simulates labor hours and cost recovery from workflow automation.</p>
            </div>
          )}

          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{running ? 'Simulating Scenario...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Results Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Simulation Results & Mathematical Projections
            </h3>
            <Badge variant="warning">SIMULATION / PROJECTED</Badge>
          </div>

          {simulationResult ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] block">Baseline State</span>
                  <div className="font-mono text-[11px] space-y-1 pt-1">
                    <div>Critical Assets: <span className="font-bold">2 Assets</span></div>
                    <div>Baseline Risk: <span className="font-bold text-slate-700 dark:text-slate-300">$24,000</span></div>
                  </div>
                </div>

                <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded border border-brand-200 dark:border-brand-800 space-y-1">
                  <span className="font-bold text-brand-700 dark:text-brand-300 uppercase text-[11px] block">Simulated Projection</span>
                  <div className="font-mono text-[11px] space-y-1 pt-1">
                    <div>Critical Assets: <span className="font-bold text-rose-600">4 Assets</span></div>
                    <div>Simulated Impact: <span className="font-bold text-rose-600">{simulationResult.simulated_summary?.simulated_downtime_cost_impact || '$42,400'}</span></div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900 space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-300 uppercase text-[11px] block">Financial Risk Delta</span>
                  <div className="font-mono text-[11px] space-y-1 pt-1">
                    <div>Risk Increase: <span className="font-bold text-rose-600">+100.0%</span></div>
                    <div>Delta Impact: <span className="font-bold text-rose-600">{simulationResult.delta?.estimated_financial_delta || '+$18,400.00'}</span></div>
                  </div>
                </div>
              </div>

              {/* Recommended Decision Box */}
              {simulationResult.recommendation && (
                <div className="p-4 bg-slate-900 text-white rounded-md border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase text-[11px] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Decision</span>
                    </span>
                    <button
                      onClick={() => navigate('/operations/maintenance/calendar', { state: { openScheduleModal: true } })}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold text-[11px]"
                    >
                      <span>Execute Recommended Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{simulationResult.recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded">
              <Sliders className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Configure parameters and click 'Execute What-If Simulation'.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
