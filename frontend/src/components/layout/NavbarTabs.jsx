import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Server
} from 'lucide-react';

export const NavbarTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard',    label: 'Reception Dashboard',       icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments Hub',           icon: CalendarDays },
    { id: 'doctors',      label: 'Doctor Availability & Slots', icon: Stethoscope },
    { id: 'patients',     label: 'Patient Directory',          icon: Users },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-1.5">
          <nav className="flex space-x-1 sm:space-x-1.5" aria-label="Hospital OPD Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer select-none outline-none ${
                    isActive
                      ? 'bg-slate-100 text-teal-900 font-bold border-slate-200 shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center pl-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Server className="w-3 h-3" />
              Live — MongoDB Atlas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
