import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PatientList } from './components/patients/PatientList';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { DoctorAvailabilityViewer } from './components/doctors/DoctorAvailabilityViewer';
import { DoctorList } from './components/doctors/DoctorList';
import { DepartmentList } from './components/departments/DepartmentList';
import { AppointmentTable } from './components/appointments/AppointmentTable';
import { AppointmentBookingModal } from './components/appointments/AppointmentBookingModal';
import { AppointmentConfirmationModal } from './components/appointments/AppointmentConfirmationModal';
import { RescheduleModal } from './components/appointments/RescheduleModal';
import { CancelModal } from './components/appointments/CancelModal';
import { patientService, doctorService, appointmentService } from './services/api';
import { getTodayDateString } from './utils/dateUtils';
import { Loader2, WifiOff, Hospital } from 'lucide-react';

function HospitalAppContent() {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [availabilitySelectedDoctorId, setAvailabilitySelectedDoctorId] = useState('');

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);

  const [patientDetailOpen, setSelectedPatientDetailOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingInitialPatient, setBookingInitialPatient] = useState(null);
  const [bookingInitialDoctorId, setBookingInitialDoctorId] = useState('');

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const loadData = useCallback(async () => {
    setServerError(false);
    try {
      const [fetchedPatients, fetchedDoctors, fetchedAppointments] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
        appointmentService.getAll(),
      ]);
      setPatients(fetchedPatients || []);
      setDoctors(fetchedDoctors || []);
      setAppointments(fetchedAppointments || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setServerError(true);
      error(`Cannot reach server: ${err.message}`);
    } finally {
      setInitialLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePatientSaved = (savedPatient) => {
    setPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPatient.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = savedPatient;
        return copy;
      }
      return [savedPatient, ...prev];
    });
  };

  const handleBookForPatient = (patient) => {
    setBookingInitialPatient(patient);
    setBookingInitialDoctorId('');
    setBookingModalOpen(true);
  };

  const handleViewPatientDetail = (patient) => {
    setSelectedPatientForDetail(patient);
    setSelectedPatientDetailOpen(true);
  };

  const handleNavigateToAvailability = (doctor) => {
    setAvailabilitySelectedDoctorId(doctor.id);
    setActiveTab('availability');
  };

  const handleBookSlotWithDoctor = (doctor) => {
    setBookingInitialDoctorId(doctor.id);
    setBookingInitialPatient(null);
    setBookingModalOpen(true);
  };

  const handleAppointmentBooked = (booked) => {
    setAppointments((prev) => [booked, ...prev]);
    setConfirmedAppointment(booked);
    setConfirmationOpen(true);
  };

  const handleAppointmentRescheduled = (updated) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAppointmentCancelled = (cancelled) => {
    setAppointments((prev) => prev.map((a) => (a.id === cancelled.id ? cancelled : a)));
  };

  const handleCompleteAppointment = async (apt) => {
    try {
      const updated = await appointmentService.complete(apt.id);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      success(`Consultation visit marked completed for ${apt.patientName}.`);
    } catch (err) {
      error(err.message || 'Failed to complete appointment.');
    }
  };

  const todayStr = getTodayDateString();
  const todayAppointmentsCount = useMemo(() => {
    return appointments.filter((a) => a.date === todayStr && a.status !== 'Cancelled').length;
  }, [appointments, todayStr]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-900/60 mb-4 animate-pulse">
          <Hospital className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Connecting to QuickCare</h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
          Loading patient database & doctor schedules...
        </p>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <WifiOff className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Cannot connect to backend server</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Unable to reach the QuickCare API service. Please check your connection and retry.
        </p>
        <button
          onClick={() => {
            setInitialLoading(true);
            loadData();
          }}
          className="px-4 py-2 bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-teal-800 transition-colors cursor-pointer shadow-sm"
        >
          Retry Backend Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenPatientModal={() => {
          setPatientToEdit(null);
          setPatientModalOpen(true);
        }}
        onOpenBookingModal={() => {
          setBookingInitialPatient(null);
          setBookingInitialDoctorId('');
          setBookingModalOpen(true);
        }}
        patientsCount={patients.length}
        todayAppointmentsCount={todayAppointmentsCount}
        doctorsCount={doctors.length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          activeTab={activeTab}
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
              setMobileSidebarOpen(!mobileSidebarOpen);
            }
          }}
          onOpenBookingModal={() => {
            setBookingInitialPatient(null);
            setBookingInitialDoctorId('');
            setBookingModalOpen(true);
          }}
          onOpenPatientModal={() => {
            setPatientToEdit(null);
            setPatientModalOpen(true);
          }}
          patients={patients}
          onViewPatient={handleViewPatientDetail}
          onBookForPatient={handleBookForPatient}
          onNavigateTab={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              onOpenPatientModal={() => {
                setPatientToEdit(null);
                setPatientModalOpen(true);
              }}
              onOpenBookingModal={() => {
                setBookingInitialPatient(null);
                setBookingInitialDoctorId('');
                setBookingModalOpen(true);
              }}
              onNavigateTab={setActiveTab}
              onViewSlip={(apt) => {
                setConfirmedAppointment(apt);
                setConfirmationOpen(true);
              }}
              onReschedule={(apt) => {
                setAppointmentToReschedule(apt);
                setRescheduleOpen(true);
              }}
              onCancel={(apt) => {
                setAppointmentToCancel(apt);
                setCancelOpen(true);
              }}
              onComplete={handleCompleteAppointment}
            />
          )}

          {activeTab === 'patients' && (
            <PatientList
              patients={patients}
              onOpenRegisterModal={() => {
                setPatientToEdit(null);
                setPatientModalOpen(true);
              }}
              onViewPatient={handleViewPatientDetail}
              onEditPatient={(p) => {
                setPatientToEdit(p);
                setPatientModalOpen(true);
              }}
              onBookForPatient={handleBookForPatient}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentTable
              appointments={appointments}
              doctors={doctors}
              onOpenBookingModal={() => {
                setBookingInitialPatient(null);
                setBookingInitialDoctorId('');
                setBookingModalOpen(true);
              }}
              onViewSlip={(apt) => {
                setConfirmedAppointment(apt);
                setConfirmationOpen(true);
              }}
              onReschedule={(apt) => {
                setAppointmentToReschedule(apt);
                setRescheduleOpen(true);
              }}
              onCancel={(apt) => {
                setAppointmentToCancel(apt);
                setCancelOpen(true);
              }}
              onComplete={handleCompleteAppointment}
            />
          )}

          {activeTab === 'availability' && (
            <DoctorAvailabilityViewer
              doctors={doctors}
              initialDoctorId={availabilitySelectedDoctorId}
              onBookSlotWithDoctor={handleBookSlotWithDoctor}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorList
              doctors={doctors}
              onNavigateToAvailability={handleNavigateToAvailability}
              onBookWithDoctor={handleBookSlotWithDoctor}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentList
              doctors={doctors}
              onNavigateToAvailability={handleNavigateToAvailability}
              onBookWithDoctor={handleBookSlotWithDoctor}
              onNavigateToDoctors={() => setActiveTab('doctors')}
            />
          )}
        </main>

        <footer className="bg-white border-t border-slate-200/90 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p className="font-medium">
              © 2026 QuickCare • Hospital Patient Registration & Appointment Management System
            </p>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-teal-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live MongoDB Atlas Connected
              </span>
              <span>•</span>
              <span>MERN Stack Architecture</span>
              <span>•</span>
              <span>Zero Double-Booking Guarantee</span>
            </div>
          </div>
        </footer>
      </div>

      <PatientFormModal
        isOpen={patientModalOpen}
        onClose={() => {
          setPatientModalOpen(false);
          setPatientToEdit(null);
        }}
        patientToEdit={patientToEdit}
        onPatientSaved={handlePatientSaved}
        allPatients={patients}
      />

      <PatientDetailModal
        isOpen={patientDetailOpen}
        onClose={() => {
          setSelectedPatientDetailOpen(false);
          setSelectedPatientForDetail(null);
        }}
        patient={selectedPatientForDetail}
        appointments={appointments}
        onEditPatient={(p) => {
          setPatientToEdit(p);
          setPatientModalOpen(true);
        }}
        onBookAppointmentForPatient={handleBookForPatient}
      />

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingInitialPatient(null);
          setBookingInitialDoctorId('');
        }}
        patients={patients}
        doctors={doctors}
        allAppointments={appointments}
        initialPatient={bookingInitialPatient}
        initialDoctorId={bookingInitialDoctorId}
        onAppointmentBooked={handleAppointmentBooked}
        onOpenNewPatientModal={() => {
          setPatientToEdit(null);
          setPatientModalOpen(true);
        }}
      />

      <AppointmentConfirmationModal
        isOpen={confirmationOpen}
        onClose={() => {
          setConfirmationOpen(false);
          setConfirmedAppointment(null);
        }}
        appointment={confirmedAppointment}
      />

      <RescheduleModal
        isOpen={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false);
          setAppointmentToReschedule(null);
        }}
        appointment={appointmentToReschedule}
        doctors={doctors}
        onAppointmentRescheduled={handleAppointmentRescheduled}
      />

      <CancelModal
        isOpen={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setAppointmentToCancel(null);
        }}
        appointment={appointmentToCancel}
        onAppointmentCancelled={handleAppointmentCancelled}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <HospitalAppContent />
    </ToastProvider>
  );
}
