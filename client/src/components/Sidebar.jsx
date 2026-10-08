import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Calendar,
  Truck, 
  Factory, 
  RefreshCw, 
  ShieldAlert, 
  Lightbulb, 
  TrendingUp, 
  Sliders, 
  CheckSquare, 
  Bot, 
  Database, 
  CheckCircle2, 
  Building2, 
  Settings, 
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, company, logout } = useAuth();
  const location = useLocation();

  const navGroups = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Inventory & Demand', path: '/operations/inventory', icon: Package },
        { name: 'Predictive Maintenance', path: '/operations/maintenance', icon: Wrench },
        { name: 'Maintenance Calendar', path: '/operations/maintenance/calendar', icon: Calendar },
        { name: 'Logistics Optimization', path: '/operations/logistics', icon: Truck },
        { name: 'Production Intelligence', path: '/operations/production', icon: Factory },
        { name: 'ReFlow AI', path: '/operations/reflow', icon: RefreshCw }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Risk Center', path: '/intelligence/risks', icon: ShieldAlert },
        { name: 'Recommendations', path: '/intelligence/recommendations', icon: Lightbulb },
        { name: 'Business Impact', path: '/intelligence/impact', icon: TrendingUp },
        { name: 'Scenarios / What-If', path: '/intelligence/scenarios', icon: Sliders },
        { name: 'Decision Outcomes', path: '/intelligence/outcomes', icon: CheckSquare },
        { name: 'AI Operations Copilot', path: '/intelligence/copilot', icon: Bot }
      ]
    },
    {
      title: 'DATA',
      items: [
        { name: 'Datasets', path: '/data/datasets', icon: Database },
        { name: 'Data Quality', path: '/data/quality', icon: CheckCircle2 }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Company Profile', path: '/admin/company', icon: Building2 },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'System Settings', path: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 select-none z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          AI
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight leading-tight text-slate-900 dark:text-slate-100">
            AI Operations
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Command Center</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              // Exact match or subpath match for navigation
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && item.path !== '/operations/maintenance' && location.pathname.startsWith(item.path)) ||
                (item.path === '/operations/maintenance' && location.pathname === '/operations/maintenance');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{user ? user.name : 'User'}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize">{user ? user.role.replace('_', ' ') : ''}</p>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
