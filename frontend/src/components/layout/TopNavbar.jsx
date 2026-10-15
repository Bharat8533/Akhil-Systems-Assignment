import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Clock,
  Plus,
  ChevronDown,
  X,
  UserPlus,
  Eye,
  CalendarPlus
} from 'lucide-react';
import { Button } from '../common/Button';

export const TopNavbar = ({
  activeTab,
  onToggleSidebar,
  onOpenBookingModal,
  onOpenPatientModal,
  patients = [],
  onViewPatient,
  onBookForPatient,
  onNavigateTab
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const breadcrumbMap = {
    dashboard: { section: 'Overview', title: 'Clinical Dashboard' },
    patients: { section: 'Patient Management', title: 'Patient Directory' },
    appointments: { section: 'Appointment Management', title: 'All Appointments' },
    availability: { section: 'Appointment Management', title: 'Doctor Availability & Slots' },
    doctors: { section: 'Hospital Resources', title: 'Physicians Directory' },
    departments: { section: 'Hospital Resources', title: 'Medical Departments' }
  };

  const currentBreadcrumb = breadcrumbMap[activeTab] || {
    section: 'Hospital Admin',
    title: 'Management Console'
  };

  const searchResults = searchQuery.trim()
    ? patients.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.fullName?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  const handleSelectPatient = (patient, action = 'view') => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (action === 'view') {
      onViewPatient(patient);
    } else if (action === 'book') {
      onBookForPatient(patient);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 select-none">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span className="truncate">{currentBreadcrumb.section}</span>
                <span>/</span>
                <span className="text-teal-700 font-semibold truncate">
                  {currentBreadcrumb.title}
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
                {currentBreadcrumb.title}
              </h1>
            </div>
          </div>

          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search patient by name, phone, or ID (e.g. PAT-0001)..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40 animate-modal-enter">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Patient EHR Search Results</span>
                  <span>{searchResults.length} matches</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-500">
                      No registered patient matches "{searchQuery}".
                    </p>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        onOpenPatientModal();
                      }}
                      className="mt-2 text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Register New Patient Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                      >
                        <div
                          onClick={() => handleSelectPatient(patient, 'view')}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {patient.fullName}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                              {patient.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {patient.gender} • {patient.age ? `${patient.age} yrs` : 'Age N/A'} • Phone: {patient.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleSelectPatient(patient, 'view')}
                            title="View Patient Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSelectPatient(patient, 'book')}
                            title="Book Appointment"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold">{formattedDate}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedTime}</span>
              </div>
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  PS
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Priya Sharma</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Duty Receptionist</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40 animate-modal-enter">
                  <div className="p-3 bg-slate-50 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-900">Priya Sharma</p>
                    <p className="text-[11px] text-slate-500">priya.sharma@akhilcare.in</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Desk #2 • Shift #1
                    </div>
                  </div>

                  <div className="p-1 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigateTab('patients');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                    >
                      Patient Directory
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigateTab('availability');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                    >
                      Doctor Availability
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenBookingModal}
              className="flex-shrink-0 shadow-sm"
            >
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
