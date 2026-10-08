import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrench, Calendar } from 'lucide-react';

export default function MaintenanceNavTabs() {
  return (
    <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
      <NavLink
        to="/operations/maintenance"
        end
        className={({ isActive }) =>
          `inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            isActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`
        }
      >
        <Wrench className="w-3.5 h-3.5" />
        <span>Predictive Maintenance & Assets</span>
      </NavLink>

      <NavLink
        to="/operations/maintenance/calendar"
        className={({ isActive }) =>
          `inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            isActive
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`
        }
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Maintenance Calendar</span>
      </NavLink>
    </div>
  );
}
