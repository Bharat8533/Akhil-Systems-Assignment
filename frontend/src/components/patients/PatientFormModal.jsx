import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  AlertCircle,
  FileText,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { calculateAge, getTodayDateString } from '../../utils/dateUtils';
import { patientService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PatientFormModal = ({
  isOpen,
  onClose,
  patientToEdit = null,
  onPatientSaved,
  allPatients = []
}) => {
  const { success, error } = useToast();
  const isEditing = Boolean(patientToEdit);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (patientToEdit) {
        setFormData({
          fullName: patientToEdit.fullName || '',
          dob: patientToEdit.dob || '',
          gender: patientToEdit.gender || 'Male',
          phone: patientToEdit.phone || '',
          email: patientToEdit.email || '',
          address: patientToEdit.address || '',
          bloodGroup: patientToEdit.bloodGroup || '',
          emergencyContactName: patientToEdit.emergencyContactName || patientToEdit.emergencyContact?.name || '',
          emergencyContactPhone: patientToEdit.emergencyContactPhone || patientToEdit.emergencyContact?.phone || '',
          allergies: patientToEdit.allergies || '',
          medicalNotes: patientToEdit.medicalNotes || ''
        });
        if (patientToEdit.dob) setCalculatedAge(calculateAge(patientToEdit.dob));
      } else {
        setFormData({
          fullName: '',
          dob: '',
          gender: 'Male',
          phone: '',
          email: '',
          address: '',
          bloodGroup: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          allergies: '',
          medicalNotes: ''
        });
        setCalculatedAge(null);
      }
      setErrors({});
    }
  }, [isOpen, patientToEdit, allPatients]);

  const handleDobChange = (e) => {
    const dob = e.target.value;
    setFormData(prev => ({ ...prev, dob }));
    if (dob) {
      const age = calculateAge(dob);
      setCalculatedAge(age);
      if (errors.dob) {
        setErrors(prev => ({ ...prev, dob: null }));
      }
    } else {
      setCalculatedAge(null);
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Full name must have at least 3 characters.';
    }

    if (!formData.dob) {
      errs.dob = 'Date of Birth is required.';
    } else {
      const today = new Date();
      const selected = new Date(formData.dob);
      if (selected > today) {
        errs.dob = 'Date of birth cannot be in the future.';
      }
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number.';
      }
    }

    if (!formData.address.trim()) {
      errs.address = 'Primary residential address is required.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    const phoneDuplicate = allPatients.find(
      p => p.phone === formData.phone.trim() && (!isEditing || p.id !== patientToEdit?.id)
    );
    if (phoneDuplicate) {
      errs.phone = `Duplicate: Phone already registered to ${phoneDuplicate.fullName} (${phoneDuplicate.id})`;
    }

    if (formData.email) {
      const emailDuplicate = allPatients.find(
        p => p.email && p.email.toLowerCase() === formData.email.trim().toLowerCase() && (!isEditing || p.id !== patientToEdit?.id)
      );
      if (emailDuplicate) {
        errs.email = `Duplicate: Email registered to ${emailDuplicate.fullName} (${emailDuplicate.id})`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        fullName:    formData.fullName.trim(),
        dob:         formData.dob,
        gender:      formData.gender,
        phone:       formData.phone.trim(),
        email:       formData.email.trim() || undefined,
        address:     formData.address.trim(),
        bloodGroup:  formData.bloodGroup || undefined,
        emergencyContactName:  formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        allergies:   formData.allergies.trim() || 'None reported',
        medicalNotes: formData.medicalNotes.trim() || undefined,
      };

      let savedPatient;
      if (isEditing) {
        savedPatient = await patientService.update(patientToEdit.id, payload);
        success(`Patient record updated: ${savedPatient.fullName}`);
      } else {
        savedPatient = await patientService.create(payload);
        success(`Patient registered: ${savedPatient.fullName} (${savedPatient.id})`);
      }

      onPatientSaved(savedPatient);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patient Record' : 'Register New Patient'}
      subtitle={isEditing ? `Modifying records for ${patientToEdit?.id}` : 'Fill in the medical demographic details to register in hospital system'}
      icon={UserCheck}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Patient ID:
            </span>
            <span className="font-mono font-bold text-xs text-teal-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {isEditing ? patientToEdit?.id : 'Auto-Generated by Server'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {isEditing ? 'Existing Record' : 'PAT-XXXX assigned on save'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Johnathan Doe"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none ${
                errors.fullName
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                  : 'border-slate-300 focus:border-teal-700'
              }`}
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              {calculatedAge !== null && (
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  Age: {calculatedAge} Yrs
                </span>
              )}
            </div>
            <input
              type="date"
              max={getTodayDateString()}
              value={formData.dob}
              onChange={handleDobChange}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none ${
                errors.dob
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                  : 'border-slate-300 focus:border-teal-700'
              }`}
            />
            {errors.dob && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.dob}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none ${
                errors.phone
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                  : 'border-slate-300 focus:border-teal-700'
              }`}
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="patient@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none ${
                errors.email
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                  : 'border-slate-300 focus:border-teal-700'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Residential Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="House/Apartment #, Street, City, State"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none ${
                errors.address
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                  : 'border-slate-300 focus:border-teal-700'
              }`}
            />
            {errors.address && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.address}
              </p>
            )}
          </div>
        </div>

        <div className="pt-3.5 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-teal-700" />
            Medical Baseline & Emergency Contact
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-teal-700"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+ Positive</option>
                <option value="A-">A- Negative</option>
                <option value="B+">B+ Positive</option>
                <option value="B-">B- Negative</option>
                <option value="O+">O+ Positive</option>
                <option value="O-">O- Negative</option>
                <option value="AB+">AB+ Positive</option>
                <option value="AB-">AB- Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                placeholder="Relative / Guardian"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Emergency Phone
              </label>
              <input
                type="tel"
                placeholder="Contact phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Known Drug / Environmental Allergies
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts (leave blank if none reported)"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reception / Intake Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Prior chronic conditions, mobility assistance needed, or special remarks..."
                value={formData.medicalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-teal-700"
              />
            </div>
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
          >
            {isEditing ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
