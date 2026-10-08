import React from 'react';
import { Settings, Shield, Cpu, Database, Server } from 'lucide-react';
import Badge from '../components/Badge';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-brand-600" />
          <span>System & AI Engine Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Hybrid Platform Configuration: Node.js Express API & Python FastAPI AI Service.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <Server className="w-4 h-4 text-brand-600" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Node.js Express API Server</h3>
              <p className="text-slate-500 text-[11px]">Port: 5000 | Multi-tenant REST Controller</p>
            </div>
          </div>
          <Badge variant="success">Online & Connected</Badge>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <Cpu className="w-4 h-4 text-brand-600" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Python FastAPI AI Engine</h3>
              <p className="text-slate-500 text-[11px]">Port: 8000 | pandas, scikit-learn, Isolation Forest, Random Forest</p>
            </div>
          </div>
          <Badge variant="success">Internal Secret Protected</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Data Isolation & Security</h3>
              <p className="text-slate-500 text-[11px]">JWT HTTP-Only Cookies | bcrypt password hashing | strict companyId filtering</p>
            </div>
          </div>
          <Badge variant="success">Enforced</Badge>
        </div>
      </div>
    </div>
  );
}
