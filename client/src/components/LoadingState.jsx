import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Running operational AI analysis...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}
