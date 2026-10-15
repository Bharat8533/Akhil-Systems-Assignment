import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  FileCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { StatusBadge, TypeBadge } from '../common/Badge';

export const AppointmentConfirmationModal = ({
  isOpen,
  onClose,
  appointment
}) => {
  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Confirmed"
      subtitle="The consultation slot is successfully reserved in the OPD schedule"
      icon={CheckCircle2}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-white border-2 border-teal-700/20 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                MediPulse Hospital • OPD Consultation Slip
              </span>
              <h3 className="font-mono font-extrabold text-lg text-slate-900 mt-0.5">
                {appointment.id}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={appointment.status} />
              <TypeBadge type={appointment.appointmentType} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Patient Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{appointment.patientName}</p>
              <p className="text-slate-500 font-mono text-[11px]">{appointment.patientId}</p>
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Consulting Physician</p>
              <p className="font-bold text-slate-900 mt-0.5">{appointment.doctorName}</p>
              <p className="text-teal-800 font-medium text-[11px]">{appointment.department}</p>
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Date</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>{formatDate(appointment.date, { withDay: true })}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Time Slot</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>{formatTime(appointment.timeSlot)}</span>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-slate-400 font-bold uppercase text-[10px]">OPD Consultation Room</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {appointment.roomNo || 'Main Outpatient Clinic Block'}
              </p>
            </div>

            {appointment.reason && (
              <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Chief Complaint / Remarks</p>
                <p className="text-slate-700 font-medium text-xs mt-0.5">{appointment.reason}</p>
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center font-medium border-t border-slate-100">
            Please report to reception counter 10 minutes prior to the scheduled consultation.
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Token Slip
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
