import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();

  switch (s) {
    case 'scheduled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
          Scheduled
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
          Cancelled
        </span>
      );
    case 'rescheduled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
          Rescheduled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
};

export const TypeBadge = ({ type }) => {
  const isFollowUp = type === 'Follow-up';
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
        isFollowUp
          ? 'bg-purple-50 text-purple-800 border border-purple-200'
          : 'bg-teal-50 text-teal-800 border border-teal-200'
      }`}
    >
      {type || 'New Visit'}
    </span>
  );
};
