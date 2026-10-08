import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { CheckCircle2, AlertTriangle, XCircle, Database } from 'lucide-react';

export default function DataQualityPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets');
        if (res.data.success) {
          setDatasets(res.data.datasets || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  if (loading) return <LoadingState message="Auditing data quality reports..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Data Quality Audit Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pre-analysis validation assessing missing values, duplicate records, empty columns, and numeric integrity.
        </p>
      </div>

      <div className="space-y-4">
        {datasets.length > 0 ? (
          datasets.map((ds, idx) => {
            const qr = ds.qualityReport || {};
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{ds.originalName}</span>
                    <Badge variant={ds.dataQualityScore >= 80 ? 'success' : 'warning'}>
                      Score: {ds.dataQualityScore}/100 ({qr.qualityLevel || 'Good'})
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">Detected: {ds.detectedModule}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">Missing Values</span>
                    <span className="text-slate-600 dark:text-slate-400">{qr.missingValuesCount || 0} cells</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">Duplicate Rows</span>
                    <span className="text-slate-600 dark:text-slate-400">{qr.duplicateRowsCount || 0} rows</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">Empty Columns</span>
                    <span className="text-slate-600 dark:text-slate-400">{qr.emptyColumns?.length || 0} columns</span>
                  </div>
                </div>

                {qr.recommendations && (
                  <div className="text-xs bg-brand-50/50 dark:bg-brand-950/30 p-3 rounded border border-brand-200 dark:border-brand-800 space-y-1">
                    <span className="font-bold text-brand-700 dark:text-brand-300">Quality Recommendations:</span>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5">
                      {qr.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-xs text-slate-500">No dataset quality audits available. Upload a dataset to view data quality score.</p>
          </div>
        )}
      </div>
    </div>
  );
}
