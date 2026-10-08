import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, badgeText, badgeColor = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorMap[badgeColor] || colorMap.blue}`}>
            {badgeText}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{subtext}</p>}
    </div>
  );
}
