import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  Plus,
  Clock,
  Stethoscope,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Hospital,
  Activity,
  ShieldCheck,
  Server
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenPatientModal,
  onOpenBookingModal,
  patientsCount = 0,
  todayAppointmentsCount = 0,
  doctorsCount = 0
}) => {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const handleActionClick = (action) => {
    setMobileOpen(false);
    if (action === 'registerPatient') {
      onOpenPatientModal();
    } else if (action === 'bookAppointment') {
      onOpenBookingModal();
    }
  };

  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount} today` : null,
          badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-700/60'
        }
      ]
    },
    {
      group: 'PATIENT MANAGEMENT',
      items: [
        {
          id: 'patients',
          label: 'Patient Directory',
          icon: Users,
          badge: patientsCount > 0 ? `${patientsCount}` : null,
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
        },
        {
          id: 'action-register',
          label: 'Register Patient',
          icon: UserPlus,
          isAction: true,
          actionType: 'registerPatient'
        }
      ]
    },
    {
      group: 'APPOINTMENT MANAGEMENT',
      items: [
        {
          id: 'appointments',
          label: 'All Appointments',
          icon: CalendarDays,
          badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount}` : null,
          badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
        },
        {
          id: 'action-book',
          label: 'Book Appointment',
          icon: Plus,
          isAction: true,
          actionType: 'bookAppointment'
        },
        {
          id: 'availability',
          label: 'Doctor Availability',
          icon: Clock
        }
      ]
    },
    {
      group: 'HOSPITAL RESOURCES',
      items: [
        {
          id: 'doctors',
          label: 'Doctors',
          icon: Stethoscope,
          badge: doctorsCount > 0 ? `${doctorsCount}` : null,
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
        },
        {
          id: 'departments',
          label: 'Departments',
          icon: Building2
        }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 select-none">
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'px-3 justify-center' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/40 flex-shrink-0 ring-1 ring-teal-500/30">
            <Hospital className="w-5 h-5 text-teal-100" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight truncate">
                  Quick<span className="text-teal-400">Care</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-950/80 text-teal-300 border border-teal-800/80">
                  EHR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate font-medium">
                Hospital Management System
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">OPD Reception</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
                {section.group}
              </h4>
            ) : (
              <div className="h-px bg-slate-800 my-2 mx-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.isAction) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleActionClick(item.actionType)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 border border-dashed border-slate-800 hover:border-slate-700 transition-all cursor-pointer ${
                        isCollapsed ? 'justify-center px-2' : ''
                      }`}
                    >
                      <div className="w-4 h-4 text-teal-400 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isCollapsed ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-950/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-teal-800 text-teal-100 border-teal-600'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800 bg-[#0B1120]/70 space-y-2">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                PS
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  Priya Sharma
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  OPD Desk #2 • Receptionist
                </p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Counter active" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center text-xs font-bold" title="Priya Sharma (OPD Desk #2)">
              PS
            </div>
          </div>
        )}

        <div className="hidden lg:flex items-center justify-between pt-1">
          {!isCollapsed && (
            <span className="text-[11px] text-slate-400 pl-1">
              Collapse sidebar
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-200 border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F172A] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
