import React from 'react';
import { Database, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyState({ 
  title = "Insufficient data for reliable analysis.", 
  message = "Please upload or select an operational dataset to perform AI model inference.",
  missingFields = [],
  actionText = "Go to Dataset Manager",
  onAction
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center max-w-xl mx-auto shadow-sm my-8">
      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="w-6 h-6" />
      </div>
      
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        {message}
      </p>

      {missingFields && missingFields.length > 0 && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md text-left text-xs border border-slate-200 dark:border-slate-700">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Missing required data fields:</span>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map((f, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-mono text-[11px]">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAction || (() => navigate('/data/datasets'))}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
      >
        <Database className="w-4 h-4" />
        <span>{actionText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
