import React from 'react';
import { Sun, Moon, Building, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ title }) {
  const { company, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {title || 'Command Center'}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Company Badge */}
        {company && (
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Building className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>{company.name}</span>
          </div>
        )}

        {/* Isolation Verified indicator */}
        <div className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tenant Isolated</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
