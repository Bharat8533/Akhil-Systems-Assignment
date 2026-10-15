import React, { useState, useEffect } from 'react';
import {
  Hospital,
  Clock,
  Calendar,
  UserPlus,
  Plus,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '../common/Button';

export const Header = ({
  onOpenPatientModal,
  onOpenBookingModal,
  activeTab
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-2xs">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  QuickCare <span className="text-teal-700">EHR</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Hospital Management System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Outpatient Department (OPD) Reception & Scheduling Portal
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedTime}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Counter #2 Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenPatientModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Register Patient</span>
            </button>

            <button
              type="button"
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2.5 ml-1 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-[11px] font-bold">
                PS
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">Priya Sharma</p>
                <p className="text-[10px] text-slate-400 leading-tight">Duty Nurse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
