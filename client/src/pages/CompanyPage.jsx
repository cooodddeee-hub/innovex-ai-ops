import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { Building2, Save, CheckCircle } from 'lucide-react';

export default function CompanyPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/company');
        if (res.data.success) setCompany(res.data.company);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/company', company);
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading company profile settings..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Company Profile & Tenant Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tenant identifier: <span className="font-mono text-slate-700 dark:text-slate-300">{company?._id}</span>
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Company profile updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
          <input
            type="text"
            required
            value={company?.name || ''}
            onChange={e => setCompany({ ...company, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
          <input
            type="text"
            value={company?.industry || ''}
            onChange={e => setCompany({ ...company, industry: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Size</label>
            <input
              type="text"
              value={company?.companySize || ''}
              onChange={e => setCompany({ ...company, companySize: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Country / Region</label>
            <input
              type="text"
              value={company?.country || ''}
              onChange={e => setCompany({ ...company, country: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Description</label>
          <textarea
            rows={3}
            value={company?.description || ''}
            onChange={e => setCompany({ ...company, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold flex items-center space-x-1.5 shadow-xs">
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
}
