import React from 'react';
import {
  User,
  Phone,
  Calendar,
  AlertTriangle,
  Shield,
  Edit,
  Plus
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge, TypeBadge } from '../common/Badge';
import { formatDate, formatTime } from '../../utils/dateUtils';

export const PatientDetailModal = ({
  isOpen,
  onClose,
  patient,
  appointments = [],
  onEditPatient,
  onBookAppointmentForPatient
}) => {
  if (!patient) return null;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient EHR Profile"
      subtitle={`Demographic & consultation records for ${patient.fullName}`}
      icon={User}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-teal-800 text-white font-bold text-lg flex items-center justify-center">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{patient.fullName}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-teal-900 border border-slate-200">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.gender} • {patient.age} Yrs (DOB: {formatDate(patient.dob)}) • Blood: <span className="font-bold text-rose-700">{patient.bloodGroup || 'Not specified'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                onClose();
                onEditPatient(patient);
              }}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                onClose();
                onBookAppointmentForPatient(patient);
              }}
            >
              Book Slot
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-teal-700" /> Contact Details
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-700">{patient.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-700 text-right max-w-[180px]">{patient.address}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-700" /> Emergency Contact
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-slate-800">{patient.emergencyContact?.name || 'None listed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{patient.emergencyContact?.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered:</span>
                <span className="font-medium text-slate-600">{formatDate(patient.registeredAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 uppercase text-[10px]">Allergies: </span>
              <span className="font-semibold text-amber-900">{patient.allergies || 'None reported'}</span>
              {patient.medicalNotes && (
                <div className="mt-1 text-slate-700">
                  <span className="font-semibold">Notes: </span> {patient.medicalNotes}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            Consultation History ({patientAppointments.length})
          </h4>

          {patientAppointments.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs">
              No appointments on record for this patient yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {patientAppointments.map(apt => (
                <div key={apt.id} className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{apt.doctorName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-normal">{apt.department}</span>
                      <TypeBadge type={apt.appointmentType} />
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {formatDate(apt.date)} at <span className="font-semibold text-slate-700">{formatTime(apt.timeSlot)}</span>
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};
