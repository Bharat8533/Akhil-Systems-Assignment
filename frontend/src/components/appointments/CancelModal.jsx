import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Trash2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { appointmentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CancelModal = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentCancelled
}) => {
  const { success, error } = useToast();
  const [reason, setReason] = useState('Patient requested cancellation');
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await appointmentService.cancel(appointment.id, reason);
      success(`Appointment ${appointment.id} cancelled. The time slot has been released back into OPD.`);
      onAppointmentCancelled(updated);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to cancel appointment.');
    } finally {
      setLoading(false);
    }
  };

  const presetReasons = [
    'Patient requested cancellation',
    'Symptoms resolved / recovered',
    'Emergency conflict / travel',
    'Doctor advised reschedule',
    'Booked in error'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Consultation Slot"
      subtitle={`Release reserved OPD slot for ${appointment.id}`}
      icon={AlertTriangle}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleCancelSubmit} className="space-y-4">
        <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-rose-900">
            <span>{appointment.patientName}</span>
            <span className="font-mono">{appointment.id}</span>
          </div>
          <div className="text-slate-600">
            <span>{appointment.doctorName}</span> • <span>{appointment.department}</span>
          </div>
          <div className="flex items-center gap-2 text-rose-800 font-semibold pt-0.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(appointment.date, { withDay: true })}</span>
            <span>•</span>
            <Clock className="w-3 h-3" />
            <span>{formatTime(appointment.timeSlot)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Cancelling will release this slot so other waiting patients can book it.
        </p>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Cancellation Reason <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-rose-600"
            required
          />

          <div className="flex flex-wrap gap-1 mt-1.5">
            {presetReasons.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Keep Booking
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="md"
            icon={Trash2}
            loading={loading}
          >
            Release Slot & Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
