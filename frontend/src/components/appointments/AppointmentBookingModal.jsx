import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SlotPicker } from './SlotPicker';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { doctorService, appointmentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AppointmentBookingModal = ({
  isOpen,
  onClose,
  patients = [],
  doctors = [],
  allAppointments = [],
  initialPatient = null,
  initialDoctorId = '',
  onAppointmentBooked,
  onOpenNewPatientModal
}) => {
  const { success, error } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState('New');
  const [reason, setReason] = useState('');

  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedPatientId(initialPatient?.id || (patients[0]?.id || ''));
      setSelectedDoctorId(initialDoctorId || (doctors[0]?.id || ''));
      setSelectedDate(getTodayDateString());
      setSelectedSlot('');
      setAppointmentType('New');
      setReason('');
      setValidationErrors({});
    }
  }, [isOpen, initialPatient, initialDoctorId, patients, doctors]);

  useEffect(() => {
    let isCancelled = false;

    const fetchSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setAvailability(null);
        return;
      }

      setLoadingSlots(true);
      try {
        const data = await doctorService.getAvailability(selectedDoctorId, selectedDate);
        if (!isCancelled) {
          setAvailability(data);
          if (selectedSlot) {
            const stillFree = data.slots?.some(s => s.time === selectedSlot && s.state === 'available');
            if (!stillFree) setSelectedSlot('');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setAvailability(null);
        }
      } finally {
        if (!isCancelled) setLoadingSlots(false);
      }
    };

    if (isOpen && selectedDoctorId && selectedDate) {
      fetchSlots();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const validate = () => {
    const errs = {};
    if (!selectedPatientId) errs.patient = 'Please select a registered patient.';
    if (!selectedDoctorId) errs.doctor = 'Please select a doctor.';
    if (!selectedDate) errs.date = 'Please pick a consultation date.';
    if (!selectedSlot) errs.slot = 'Please click to select an available time slot.';
    if (!reason.trim()) errs.reason = 'Please enter a chief complaint or reason for consultation.';

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setBookingLoading(true);
    try {
      const payload = {
        patientId:       selectedPatient.id,
        doctorId:        selectedDoctor.id,
        date:            selectedDate,
        timeSlot:        selectedSlot,
        appointmentType,
        reason:          reason.trim(),
      };

      const booked = await appointmentService.create(payload);
      success(`Appointment confirmed for ${booked.patientName} with ${booked.doctorName}!`);
      onAppointmentBooked(booked);
      onClose();
    } catch (err) {
      error(err.message || 'Slot no longer available. Please select another.');
      if (selectedDoctorId && selectedDate) {
        const updatedAvail = await doctorService.getAvailability(selectedDoctorId, selectedDate);
        setAvailability(updatedAvail);
        setSelectedSlot('');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const reasonChips = [
    'General Consultation',
    'Follow-up Review',
    'Chest Discomfort / BP',
    'Joint Pain & Mobility',
    'Fever & Cold',
    'Prescription Refill'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Consultation"
      subtitle="Verify patient, pick physician, and schedule an available OPD slot"
      icon={CalendarDays}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleBookingSubmit} className="space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              1. Patient Identification <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewPatientModal();
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
            >
              + Register New Patient
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  if (validationErrors.patient) setValidationErrors(prev => ({ ...prev, patient: null }));
                }}
                className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold bg-white focus:outline-none ${
                  validationErrors.patient
                    ? 'border-rose-400 text-rose-900'
                    : 'border-slate-300 focus:border-teal-700'
                }`}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id}) — {p.phone}
                  </option>
                ))}
              </select>
              {validationErrors.patient && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.patient}
                </p>
              )}
            </div>

            {selectedPatient && (
              <div className="bg-white rounded-lg p-2 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{selectedPatient.fullName}</span>
                  <p className="text-[11px] text-slate-500">
                    {selectedPatient.gender}, {selectedPatient.age} yrs • Blood: {selectedPatient.bloodGroup || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] border border-teal-200">
                    {selectedPatient.id}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedPatient.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              2. Consulting Physician <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedSlot('');
                if (validationErrors.doctor) setValidationErrors(prev => ({ ...prev, doctor: null }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({d.consultationDuration} min) {!d.isActive ? '[Inactive]' : ''}
                </option>
              ))}
            </select>
            {selectedDoctor && (
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedDoctor.department} • Room: {selectedDoctor.roomNo || '—'} • Hours: {selectedDoctor.workingHours?.start} - {selectedDoctor.workingHours?.end}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              3. Consultation Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              min={getTodayDateString()}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-700"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Selected Day: <span className="font-semibold text-slate-700">{formatDate(selectedDate, { withDay: true })}</span>
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              4. Available OPD Slots <span className="text-rose-500">*</span>
            </label>
            {selectedSlot && (
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Selected: {selectedSlot}
              </span>
            )}
          </div>

          <SlotPicker
            availability={availability}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              if (validationErrors.slot) setValidationErrors(prev => ({ ...prev, slot: null }));
            }}
            loading={loadingSlots}
          />
          {validationErrors.slot && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {validationErrors.slot}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Visit Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAppointmentType('New')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    appointmentType === 'New'
                      ? 'bg-teal-50 text-teal-800 border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  New Visit
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentType('Follow-up')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    appointmentType === 'Follow-up'
                      ? 'bg-purple-50 text-purple-800 border-purple-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Follow-up
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Chief Complaint / Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Describe symptom or purpose of visit..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (validationErrors.reason) setValidationErrors(prev => ({ ...prev, reason: null }));
                }}
                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none ${
                  validationErrors.reason
                    ? 'border-rose-400 text-rose-900'
                    : 'border-slate-300 focus:border-teal-700'
                }`}
              />
              {validationErrors.reason && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.reason}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
            {reasonChips.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setReason(chip);
                  if (validationErrors.reason) setValidationErrors(prev => ({ ...prev, reason: null }));
                }}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {selectedSlot ? (
              <span className="text-teal-800 font-semibold">
                Slot: {selectedSlot} on {formatDate(selectedDate)}
              </span>
            ) : (
              <span>Select an available time slot</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={bookingLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={bookingLoading}
              disabled={!selectedSlot}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
