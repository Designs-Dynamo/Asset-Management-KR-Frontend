import React from 'react';

const StatusBadge = ({ status, color }) => {
  
  // 1. Define your color styles
  const styles = {
    green: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20',
    amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-500/20',
    red:   'bg-rose-100 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20 dark:font-size-20', // Added Red style
    slate: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 border border-slate-200 dark:border-slate-500/20',
    blue:  'bg-blue-100 dark:bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-500/20',
  };

  // 2. Logic to automatically pick color if not passed explicitly
  let finalColor = color;

  if (!finalColor) {
    const s = status?.toLowerCase() || "";
    
    if (s === 'assigned' || s === 'active' || s === 'deployed') {
      finalColor = 'green';
    } else if (s === 'maintenance' || s === 'repair') {
      finalColor = 'amber';
    } else if (s === 'unassigned' || s === 'broken' || s === 'lost') {
      finalColor = 'red';
    } else {
      finalColor = 'slate';
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[finalColor] || styles.slate}`}>
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;