import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
  CalendarOff,
  User,
  Plus,
  AlertTriangle,
  Building,
  Phone
} from 'lucide-react';
import { Button } from '../common/Button';
import { SlotPicker } from '../appointments/SlotPicker';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { doctorService } from '../../services/api';

export const DoctorAvailabilityViewer = ({
  doctors = [],
  onBookSlotWithDoctor,
  initialDoctorId = ''
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  const todayStr = getTodayDateString();

  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    } else if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId, initialDoctorId]);

  useEffect(() => {
    let isCancelled = false;

    const fetchSlots = async () => {
      if (!selectedDoctorId || !selectedDate) return;
      setLoading(true);
      try {
        const data = await doctorService.getAvailability(selectedDoctorId, selectedDate);
        if (!isCancelled) {
          setAvailability(data);
          setSelectedSlot('');
        }
      } catch (err) {
        if (!isCancelled) console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchSlots();

    return () => {
      isCancelled = true;
    };
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const setDateShortcut = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Hospital Medical Staff Directory ({doctors.length} Physicians)
            </h3>
            <p className="text-xs text-slate-500">
              Select a doctor to view their weekly OPD schedule, break intervals, and live slot vacancies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {doctors.map(doc => {
            const isSelected = doc.id === selectedDoctorId;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/40 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatar || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg'}
                    alt={doc.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg';
                    }}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        doc.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-teal-800 truncate mt-0.5">{doc.department}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doc.qualification}</p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{doc.roomNo}</span>
                      <span className="font-semibold text-slate-700">{doc.consultationDuration} min / slot</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDoctor && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedDoctor.name}</h4>
                <p className="text-xs text-slate-500">
                  {selectedDoctor.department} • OPD: {selectedDoctor.workingHours.start} to {selectedDoctor.workingHours.end} • Room: {selectedDoctor.roomNo}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setDateShortcut(0)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedDate === todayStr ? 'bg-white shadow-2xs text-teal-800 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut(1)}
                  className="px-2.5 py-1 rounded hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut(2)}
                  className="px-2.5 py-1 rounded hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Day After
                </button>
              </div>

              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Weekly Clinic Days</span>
              <p className="font-semibold text-slate-800 mt-0.5">{selectedDoctor.workingDays.join(', ')}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Consultation duration: {selectedDoctor.consultationDuration} min</p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
              <span className="text-amber-800 font-bold uppercase text-[10px] flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-600" /> Protected Break Periods
              </span>
              <p className="font-semibold text-amber-900 mt-0.5">
                {selectedDoctor.breakPeriods.map(b => `${b.label}: ${b.start} - ${b.end}`).join(', ')}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">Bookings prohibited during break</p>
            </div>

            <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs">
              <span className="text-teal-800 font-bold uppercase text-[10px]">Leave Calendar</span>
              <p className="font-semibold text-teal-900 mt-0.5">
                {selectedDoctor.leaveDates?.length > 0
                  ? `Approved Leave: ${selectedDoctor.leaveDates.join(', ')}`
                  : 'No scheduled leaves'}
              </p>
              <p className="text-[11px] text-teal-700 mt-0.5">HR Roster verified</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                Available Slots on {formatDate(selectedDate, { withDay: true })}
              </h4>

              {selectedSlot && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => onBookSlotWithDoctor(selectedDoctor, selectedDate, selectedSlot)}
                >
                  Book Slot ({selectedSlot})
                </Button>
              )}
            </div>

            <SlotPicker
              availability={availability}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              loading={loading}
            />

            {selectedSlot && (
              <div className="mt-3.5 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span className="font-bold text-teal-900">
                    Selected: {selectedSlot} on {formatDate(selectedDate)} with {selectedDoctor.name}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onBookSlotWithDoctor(selectedDoctor, selectedDate, selectedSlot)}
                >
                  Proceed to Patient Booking
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
