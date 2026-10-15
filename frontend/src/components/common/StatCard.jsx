import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorScheme = 'teal',
  onClick,
  badgeText
}) => {
  const schemes = {
    teal: {
      bgIcon: 'bg-teal-50 text-teal-700 border-teal-200/70',
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    blue: {
      bgIcon: 'bg-sky-50 text-sky-700 border-sky-200/70',
      badge: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-700 border-rose-200/70',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
    }
  }[colorScheme] || {
    bgIcon: 'bg-teal-50 text-teal-700 border-teal-200/70',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h4>
            {badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${schemes.badge}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${schemes.bgIcon} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
