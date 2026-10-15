import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Search,
  Clock,
  Coffee,
  Calendar,
  Building2,
  Phone,
  Mail,
  UserCheck,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  CalendarClock
} from 'lucide-react';
import { Button } from '../common/Button';

export const DoctorList = ({
  doctors = [],
  onNavigateToAvailability,
  onBookWithDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const departments = useMemo(() => {
    return Array.from(new Set(doctors.map((d) => d.department).filter(Boolean)));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (departmentFilter !== 'all' && doc.department !== departmentFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        doc.name?.toLowerCase().includes(q) ||
        doc.id?.toLowerCase().includes(q) ||
        doc.specialization?.toLowerCase().includes(q) ||
        doc.department?.toLowerCase().includes(q)
      );
    });
  }, [doctors, searchQuery, departmentFilter]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                Hospital Resources
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Medical Staff Roster ({doctors.length} Physicians)
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Doctors & Clinical Specialists
            </h2>
            <p className="text-xs text-slate-500">
              Browse attending specialists across outpatient departments, view consulting hours, and manage appointment booking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Doctor Name, ID, or Specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center shadow-2xs">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No doctors match your search</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or selecting another department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => {
            const initials = doc.name
              ? doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')
              : 'DR';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.avatar || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg'}
                      alt={doc.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg';
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs bg-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {doc.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            doc.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-teal-700 truncate mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ID: {doc.id} • {doc.department}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Clinic Days
                      </span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]" title={doc.workingDays?.join(', ')}>
                        {doc.workingDays?.join(', ') || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        OPD Hours
                      </span>
                      <span className="font-semibold text-slate-800">
                        {doc.workingHours?.start} - {doc.workingHours?.end}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        Break Interval
                      </span>
                      <span className="font-medium text-amber-800">
                        {doc.breakPeriods?.length > 0
                          ? doc.breakPeriods.map((b) => `${b.start}-${b.end}`).join(', ')
                          : 'None'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Consultation Slot
                      </span>
                      <span className="font-bold text-teal-800">
                        {doc.consultationDuration || 30} minutes
                      </span>
                    </div>

                    {doc.phone && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          Direct Line
                        </span>
                        <span className="font-mono text-slate-700">{doc.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToAvailability(doc)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Check Slots</span>
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => onBookWithDoctor(doc)}
                    className="flex-1 text-xs"
                  >
                    Book Patient
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
