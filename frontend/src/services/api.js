const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://akhil-systems-assignment.onrender.com/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || json.errors?.[0]?.message || `Request failed (${res.status})`);
  }

  return json;
}

const toISODate = (date, timeSlot) => {
  if (!date || !timeSlot) return null;
  const [h, m] = timeSlot.split(':').map(Number);
  const [y, mo, d] = date.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m, 0, 0).toISOString();
};

const formatPatient = (p) => {
  if (!p) return null;
  return {
    ...p,
    id: p.patientId || p._id,
    dob: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
    age: p.age ?? '',
    email: p.email || '',
    bloodGroup: p.bloodGroup || '',
    emergencyContact: p.emergencyContact || {},
    emergencyContactName: p.emergencyContact?.name || '',
    emergencyContactPhone: p.emergencyContact?.phone || '',
    allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || 'None reported'),
    medicalNotes: p.notes || '',
    registeredAt: p.registrationDate || p.createdAt,
    isActive: p.isActive !== false,
  };
};

const formatDoctor = (d) => {
  if (!d) return null;
  const hours = d.workingHours || [];
  return {
    ...d,
    id: d.doctorId || d._id,
    qualification: d.qualification || d.specialization,
    phone: d.phone || '',
    email: d.email || '',
    avatar: d.avatar || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg',
    consultationDuration: d.consultationDuration || 30,
    isActive: d.isActive !== false,
    workingDays: hours.map(h => h.day),
    workingHours: {
      start: hours[0]?.start || '09:00',
      end: hours[0]?.end || '17:00',
    },
    workingHoursArray: hours,
    breakPeriods: d.breakPeriods || [],
    leaveDates: d.leaveDates || [],
  };
};

const formatAppointment = (a) => {
  if (!a) return null;
  const d = a.appointmentDate ? new Date(a.appointmentDate) : null;
  const patient = typeof a.patient === 'object' && a.patient ? a.patient : {};
  const doctor = typeof a.doctor === 'object' && a.doctor ? a.doctor : {};

  return {
    ...a,
    id: a.appointmentId || a._id,
    patientId: patient.patientId || a.patientId || '',
    patientName: patient.fullName || a.patientName || '',
    patientPhone: patient.phone || '',
    doctorId: doctor.doctorId || a.doctorId || '',
    doctorName: doctor.name || a.doctorName || '',
    department: doctor.department || a.department || '',
    date: d ? d.toISOString().slice(0, 10) : '',
    timeSlot: d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '',
  };
};

const formatAvailability = (data, duration = 30) => {
  if (!data) return null;

  if (data.reason) {
    const r = data.reason.toLowerCase();
    const status = r.includes('leave') ? 'on_leave' : r.includes('inactive') ? 'inactive' : 'off_duty';
    return { status, message: data.reason, slots: [], summary: { available: 0, booked: 0 } };
  }

  const getTime = (iso) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getPeriod = (time) => {
    const h = parseInt(time, 10);
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  };

  const mapSlots = (list, state) =>
    (list || []).map(iso => {
      const time = getTime(iso);
      return { time, state, period: getPeriod(time), duration };
    });

  const available = mapSlots(data.available, 'available');
  const booked = mapSlots(data.booked, 'booked');

  return {
    slots: [...available, ...booked].sort((a, b) => a.time.localeCompare(b.time)),
    summary: { available: available.length, booked: booked.length },
  };
};

const preparePatientPayload = (data) => ({
  fullName: data.fullName?.trim(),
  dateOfBirth: data.dob,
  gender: data.gender,
  phone: data.phone?.trim(),
  address: data.address?.trim(),
  email: data.email?.trim() || undefined,
  bloodGroup: data.bloodGroup || undefined,
  emergencyContact: (data.emergencyContactName || data.emergencyContact?.name) ? {
    name: (data.emergencyContactName || data.emergencyContact?.name)?.trim(),
    phone: (data.emergencyContactPhone || data.emergencyContact?.phone)?.trim(),
  } : undefined,
  allergies: data.allergies && data.allergies !== 'None reported'
    ? data.allergies.split(',').map(a => a.trim()).filter(Boolean)
    : [],
  notes: data.medicalNotes?.trim() || undefined,
});

export const patientService = {
  getAll: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=500` : '?limit=500';
    const res = await api(`/patients${query}`);
    return (res.data || []).map(formatPatient);
  },

  getById: async (id) => {
    const res = await api(`/patients/${id}`);
    return formatPatient(res.data);
  },

  create: async (data) => {
    const res = await api('/patients', {
      method: 'POST',
      body: JSON.stringify(preparePatientPayload(data)),
    });
    return formatPatient(res.data);
  },

  update: async (id, data) => {
    const res = await api(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(preparePatientPayload(data)),
    });
    return formatPatient(res.data);
  },
};

export const doctorService = {
  getAll: async () => {
    const res = await api('/doctors?limit=100&isActive=true');
    return (res.data || []).map(formatDoctor);
  },

  getAvailability: async (doctorId, date) => {
    const res = await api(`/doctors/${doctorId}/availability?date=${date}`);
    return formatAvailability(res.data, res.data?.doctor?.consultationDuration || 30);
  },
};

export const appointmentService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams({ limit: '500' });
    if (filters.date) params.append('date', filters.date);
    if (filters.doctorId && filters.doctorId !== 'all') params.append('doctorId', filters.doctorId);
    if (filters.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await api(`/appointments?${params}`);
    return (res.data || []).map(formatAppointment);
  },

  create: async ({ patientId, doctorId, date, timeSlot, appointmentType, reason }) => {
    const res = await api('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        doctorId,
        appointmentDate: toISODate(date, timeSlot),
        appointmentType,
        reason,
      }),
    });
    return formatAppointment(res.data);
  },

  cancel: async (id, reason = 'Cancelled by reception') => {
    const res = await api(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return formatAppointment(res.data);
  },

  reschedule: async (id, { newDate, newTimeSlot, reason = 'Rescheduled by reception' }) => {
    const res = await api(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({
        newDate: toISODate(newDate, newTimeSlot),
        reason,
      }),
    });
    return formatAppointment(res.data);
  },

  complete: async (id) => {
    const res = await api(`/appointments/${id}/complete`, { method: 'PATCH' });
    return formatAppointment(res.data);
  },
};

export const dashboardService = {
  getSummary: async () => {
    const res = await api('/dashboard');
    return res.data;
  },
};
