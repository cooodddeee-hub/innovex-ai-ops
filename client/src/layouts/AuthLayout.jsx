import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-sm">
            AI
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            "Predict problems. Understand impact. Prioritize actions."
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
