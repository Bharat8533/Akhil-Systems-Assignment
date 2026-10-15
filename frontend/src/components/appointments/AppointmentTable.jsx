import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Stethoscope,
  Clock,
  CalendarClock,
  Ban,
  CheckCircle2,
  Eye,
  Plus,
  FileText,
  User,
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatDate, formatTime, getTodayDateString } from '../../utils/dateUtils';

export const AppointmentTable = ({
  appointments = [],
  doctors = [],
  onOpenBookingModal,
  onViewSlip,
  onReschedule,
  onCancel,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const todayStr = getTodayDateString();

  const departments = useMemo(() => {
    return Array.from(new Set(doctors.map((d) => d.department).filter(Boolean)));
  }, [doctors]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (activeTab === 'today' && apt.date !== todayStr) return false;
      if (
        activeTab === 'upcoming' &&
        (apt.date <= todayStr || apt.status === 'Cancelled' || apt.status === 'Completed')
      ) {
        return false;
      }
      if (activeTab === 'completed' && apt.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && apt.status !== 'Cancelled') return false;

      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      if (selectedDepartment !== 'all' && apt.department !== selectedDepartment) return false;
      if (selectedDate && apt.date !== selectedDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          apt.id?.toLowerCase().includes(q) ||
          apt.patientName?.toLowerCase().includes(q) ||
          (apt.patientId && apt.patientId.toLowerCase().includes(q)) ||
          (apt.patientPhone && apt.patientPhone.includes(q)) ||
          apt.doctorName?.toLowerCase().includes(q) ||
          (apt.reason && apt.reason.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [appointments, activeTab, selectedDoctorId, selectedDepartment, selectedDate, searchQuery, todayStr]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setSelectedDoctorId('all');
    setSelectedDepartment('all');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDoctorId !== 'all' ||
    selectedDepartment !== 'all' ||
    selectedDate ||
    activeTab !== 'all';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Records', count: appointments.length },
              {
                id: 'today',
                label: "Today's",
                count: appointments.filter((a) => a.date === todayStr).length
              },
              {
                id: 'upcoming',
                label: 'Upcoming',
                count: appointments.filter((a) => a.date > todayStr && a.status === 'Scheduled').length
              },
              {
                id: 'completed',
                label: 'Completed',
                count: appointments.filter((a) => a.status === 'Completed').length
              },
              {
                id: 'cancelled',
                label: 'Cancelled',
                count: appointments.filter((a) => a.status === 'Cancelled').length
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenBookingModal}
            className="flex-shrink-0 shadow-xs"
          >
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, or Apt #..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-1.5 whitespace-nowrap cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Appointments Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {hasActiveFilters
                ? 'Adjust the filters or search keywords above to view records.'
                : 'No appointment bookings found in the hospital system.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset Search Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={onOpenBookingModal}
              >
                Book First Consultation
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Appointment ID</th>
                  <th className="py-3.5 px-4">Patient Information</th>
                  <th className="py-3.5 px-4">Attending Doctor & Specialty</th>
                  <th className="py-3.5 px-4">Date & Time Slot</th>
                  <th className="py-3.5 px-4">Visit Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedAppointments.map((apt) => {
                  const isScheduled = apt.status === 'Scheduled';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => onViewSlip(apt)}
                          className="hover:text-teal-800 hover:underline cursor-pointer"
                        >
                          {apt.id}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {apt.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {apt.patientId || apt.patientPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                        <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                          {apt.department}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(apt.date)}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-teal-800 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{formatTime(apt.timeSlot)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <TypeBadge type={apt.appointmentType} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={apt.status} />
                        {apt.cancelReason && (
                          <div
                            className="text-[10px] text-rose-500 mt-0.5 max-w-[140px] truncate"
                            title={apt.cancelReason}
                          >
                            {apt.cancelReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewSlip(apt)}
                            title="View / Print Token Slip"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isScheduled && (
                            <button
                              onClick={() => onComplete(apt)}
                              title="Mark Visit as Completed"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {isScheduled && (
                            <button
                              onClick={() => onReschedule(apt)}
                              title="Reschedule to New Slot"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <CalendarClock className="w-4 h-4" />
                            </button>
                          )}

                          {isScheduled && (
                            <button
                              onClick={() => onCancel(apt)}
                              title="Cancel & Release Slot"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of{' '}
              {filteredAppointments.length} appointments
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
