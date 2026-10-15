import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SlotPicker } from './SlotPicker';
import { getTodayDateString, formatDate, formatTime } from '../../utils/dateUtils';
import { doctorService, appointmentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const RescheduleModal = ({
  isOpen,
  onClose,
  appointment,
  doctors = [],
  onAppointmentRescheduled
}) => {
  const { success, error } = useToast();

  const [newDate, setNewDate] = useState(getTodayDateString());
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [reason, setReason] = useState('Patient requested time change');
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen && appointment) {
      setNewDate(appointment.date || getTodayDateString());
      setNewTimeSlot('');
      setReason('Patient requested time change');
      setValidationError('');
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    let isCancelled = false;

    const fetchSlots = async () => {
      if (!appointment?.doctorId || !newDate) return;
      setLoadingSlots(true);
      try {
        const data = await doctorService.getAvailability(appointment.doctorId, newDate);
        if (!isCancelled) {
          setAvailability(data);
          if (newTimeSlot && !data.slots?.some(s => s.time === newTimeSlot && s.state === 'available')) {
            setNewTimeSlot('');
          }
        }
      } catch (err) {
        if (!isCancelled) console.error(err);
      } finally {
        if (!isCancelled) setLoadingSlots(false);
      }
    };

    if (isOpen && appointment?.doctorId) {
      fetchSlots();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, appointment?.doctorId, newDate]);

  if (!appointment) return null;

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) {
      setValidationError('Please select a new consultation date.');
      return;
    }
    if (!newTimeSlot) {
      setValidationError('Please select an available time slot.');
      return;
    }
    if (newDate === appointment.date && newTimeSlot === appointment.timeSlot) {
      setValidationError('Please pick a different date or time slot from the original booking.');
      return;
    }

    setRescheduling(true);
    setValidationError('');

    try {
      const updated = await appointmentService.reschedule(appointment.id, {
        newDate,
        newTimeSlot,
        reason: reason.trim() || 'Rescheduled by reception'
      });
      success(`Appointment ${appointment.id} rescheduled to ${formatDate(newDate)} at ${formatTime(newTimeSlot)}`);
      onAppointmentRescheduled(updated);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to reschedule.');
      setValidationError(err.message);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      subtitle={`Change schedule for ${appointment.patientName} (${appointment.id})`}
      icon={CalendarClock}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleRescheduleSubmit} className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="w-full sm:w-1/2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Slot</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{appointment.doctorName}</p>
            <p className="text-slate-500">{appointment.department}</p>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 w-fit">
              <Clock className="w-3 h-3" />
              <span>{formatDate(appointment.date)} at {formatTime(appointment.timeSlot)}</span>
            </div>
          </div>

          <div className="hidden sm:block text-slate-300">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="w-full sm:w-1/2 bg-white p-2.5 rounded-lg border border-teal-200">
            <span className="text-[10px] uppercase font-bold text-teal-800">New Target Slot</span>
            {newTimeSlot ? (
              <div className="flex items-center gap-1.5 mt-1 font-bold text-teal-900 bg-teal-50 px-2 py-1 rounded border border-teal-300">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>{formatDate(newDate)} at {formatTime(newTimeSlot)}</span>
              </div>
            ) : (
              <p className="text-slate-400 italic mt-1 text-[11px]">Choose date & time slot below</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            Pick New Consultation Date
          </label>
          <input
            type="date"
            min={getTodayDateString()}
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setNewTimeSlot('');
              setValidationError('');
            }}
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            Available Slots on {formatDate(newDate, { withDay: true })}
          </label>
          <SlotPicker
            availability={availability}
            selectedSlot={newTimeSlot}
            onSelectSlot={(slot) => {
              setNewTimeSlot(slot);
              setValidationError('');
            }}
            loading={loadingSlots}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Reason for Rescheduling
          </label>
          <input
            type="text"
            placeholder="e.g. Patient schedule conflict..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-teal-700"
          />
        </div>

        {validationError && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={rescheduling}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={rescheduling}
            disabled={!newTimeSlot}
          >
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
