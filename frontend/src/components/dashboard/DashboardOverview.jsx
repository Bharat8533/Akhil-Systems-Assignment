import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  Stethoscope,
  Clock,
  UserPlus,
  Plus,
  Eye,
  Check,
  ArrowRight,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { StatusBadge, TypeBadge } from '../common/Badge';
import {
  formatDate,
  formatTime,
  getTodayDateString,
  getDayOfWeek,
  timeToMinutes
} from '../../utils/dateUtils';

export const DashboardOverview = ({
  patients = [],
  doctors = [],
  appointments = [],
  onOpenPatientModal,
  onOpenBookingModal,
  onNavigateTab,
  onViewSlip,
  onReschedule,
  onCancel,
  onComplete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const todayStr = getTodayDateString();
  const currentDayOfWeek = getDayOfWeek(todayStr);

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === todayStr);
  }, [appointments, todayStr]);

  const scheduledToday = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const completedToday = todayAppointments.filter((a) => a.status === 'Completed').length;

  const totalPatients = patients.length;

  const activeDoctors = doctors.filter((d) => d.isActive).length;

  const availableSlotsToday = useMemo(() => {
    if (!doctors.length) return 0;

    let totalAvailable = 0;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    doctors.forEach((doc) => {
      if (!doc.isActive) return;
      if (doc.leaveDates && doc.leaveDates.includes(todayStr)) return;

      const workDay = (doc.workingHoursArray || []).find((wh) => wh.day === currentDayOfWeek)
        || ((doc.workingDays || []).includes(currentDayOfWeek) ? { start: doc.workingHours?.start, end: doc.workingHours?.end } : null);

      if (!workDay || !workDay.start || !workDay.end) return;

      const duration = doc.consultationDuration || 30;
      const dayStart = timeToMinutes(workDay.start);
      const dayEnd = timeToMinutes(workDay.end);

      let doctorAvailableSlots = 0;

      for (let m = dayStart; m + duration <= dayEnd; m += duration) {
        if (m <= currentMinutes) continue;

        const slotEnd = m + duration;
        const inBreak = (doc.breakPeriods || []).some((bp) => {
          const bStart = timeToMinutes(bp.start);
          const bEnd = timeToMinutes(bp.end);
          return m < bEnd && slotEnd > bStart;
        });
        if (inBreak) continue;

        doctorAvailableSlots++;
      }

      const bookedCount = todayAppointments.filter(
        (a) => (a.doctorId === doc.id || a.doctorName === doc.name) && a.status === 'Scheduled'
      ).length;

      totalAvailable += Math.max(0, doctorAvailableSlots - bookedCount);
    });

    return totalAvailable;
  }, [doctors, todayAppointments, currentDayOfWeek, todayStr]);

  const departments = useMemo(() => {
    return Array.from(new Set(doctors.map((d) => d.department).filter(Boolean)));
  }, [doctors]);

  const filteredTodayAppointments = useMemo(() => {
    return todayAppointments.filter((apt) => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      if (deptFilter !== 'all' && apt.department !== deptFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          apt.patientName?.toLowerCase().includes(q) ||
          apt.patientId?.toLowerCase().includes(q) ||
          apt.doctorName?.toLowerCase().includes(q) ||
          apt.id?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [todayAppointments, statusFilter, deptFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTodayAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredTodayAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Today's appointments, doctor availability, and patient intake
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={UserPlus}
            onClick={onOpenPatientModal}
          >
            Register Patient
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenBookingModal}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtext={`${scheduledToday} scheduled, ${completedToday} completed`}
          icon={CalendarDays}
          colorScheme="teal"
          onClick={() => onNavigateTab('appointments')}
        />

        <StatCard
          title="Registered Patients"
          value={totalPatients}
          subtext="Total patient records"
          icon={Users}
          colorScheme="blue"
          onClick={() => onNavigateTab('patients')}
        />

        <StatCard
          title="Active Doctors"
          value={`${activeDoctors} / ${doctors.length}`}
          subtext={`Across ${departments.length || 5} departments`}
          icon={Stethoscope}
          colorScheme="emerald"
          onClick={() => onNavigateTab('doctors')}
        />

        <StatCard
          title="Total Open Slots"
          value={availableSlotsToday}
          subtext={`Across all on-duty doctors today`}
          icon={Clock}
          colorScheme="rose"
          onClick={() => onNavigateTab('availability')}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onOpenPatientModal}
            className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-slate-50/50 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                Register Patient
              </p>
              <p className="text-[11px] text-slate-500">Add new patient record</p>
            </div>
          </button>

          <button
            onClick={onOpenBookingModal}
            className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-slate-50/50 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                Book Appointment
              </p>
              <p className="text-[11px] text-slate-500">Schedule consultation</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('patients')}
            className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-slate-50/50 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-700 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-900">
                Patient Directory
              </p>
              <p className="text-[11px] text-slate-500">Browse all patients</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('availability')}
            className="p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-slate-50/50 transition-all text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                Doctor Availability
              </p>
              <p className="text-[11px] text-slate-500">Check open time slots</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Today's Schedule
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatDate(todayStr, { withDay: true })} • {todayAppointments.length} appointments
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient, ID, or doctor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-700 font-medium"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredTodayAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs px-4">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">
              {searchQuery || statusFilter !== 'all' || deptFilter !== 'all'
                ? 'No matching appointments found.'
                : 'No appointments scheduled for today.'}
            </p>
            <div className="mt-3">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={onOpenBookingModal}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedAppointments.map((apt) => {
                  const isScheduled = apt.status === 'Scheduled';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-teal-800">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{formatTime(apt.timeSlot)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {apt.patientId || apt.patientPhone}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                        <div className="text-[11px] text-teal-700 font-medium">
                          {apt.department}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <TypeBadge type={apt.appointmentType} />
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={apt.status} />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewSlip(apt)}
                            title="View Slip"
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isScheduled && (
                            <button
                              onClick={() => onComplete(apt)}
                              title="Mark Completed"
                              className="p-1.5 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isScheduled && (
                            <button
                              onClick={() => onCancel(apt)}
                              title="Cancel Appointment"
                              className="p-1.5 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
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
              {Math.min(currentPage * itemsPerPage, filteredTodayAppointments.length)} of{' '}
              {filteredTodayAppointments.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
