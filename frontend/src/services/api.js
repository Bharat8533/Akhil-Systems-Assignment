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
    const errorMsg = json.message || (json.errors && json.errors[0]?.message) || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return json;
}

const formatPatient = (p) => {
  if (!p) return null;
  return {
    id: p.patientId || p._id,
    _id: p._id,
    fullName: p.fullName,
    dob: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
    age: p.age ?? '',
    gender: p.gender,
    phone: p.phone,
    email: p.email || '',
    address: p.address,
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
    id: d.doctorId || d._id,
    _id: d._id,
    name: d.name,
    specialization: d.specialization,
    department: d.department,
    qualification: d.qualification || d.specialization,
    phone: d.phone || '',
    email: d.email || '',
    avatar: d.avatar || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg',
    consultationDuration: d.consultationDuration || 30,
    isActive: d.isActive !== false,
    roomNo: d.roomNo || '',
    leaveDates: d.leaveDates || [],
    workingDays: hours.map(h => h.day),
    workingHours: {
      start: hours[0]?.start || '09:00',
      end: hours[0]?.end || '17:00',
    },
    workingHoursArray: hours,
    breakPeriods: d.breakPeriods || [],
  };
};

const formatAppointment = (a) => {
  if (!a) return null;
  const dateObj = a.appointmentDate ? new Date(a.appointmentDate) : null;
  const patient = typeof a.patient === 'object' && a.patient ? a.patient : {};
  const doctor = typeof a.doctor === 'object' && a.doctor ? a.doctor : {};

  return {
    id: a.appointmentId || a._id,
    _id: a._id,
    patientId: patient.patientId || '',
    patientName: patient.fullName || '',
    patientPhone: patient.phone || '',
    doctorId: doctor.doctorId || '',
    doctorName: doctor.name || '',
    department: doctor.department || a.department || '',
    date: dateObj ? dateObj.toISOString().slice(0, 10) : '',
    timeSlot: dateObj ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}` : '',
    appointmentType: a.appointmentType,
    reason: a.reason || '',
    status: a.status,
    cancelReason: a.cancelReason || '',
    cancelledAt: a.cancelledAt,
    createdAt: a.createdAt,
  };
};

const formatAvailability = (data, duration = 30) => {
  if (!data) return null;

  if (data.reason) {
    const reason = data.reason.toLowerCase();
    const status = reason.includes('leave') ? 'on_leave' : reason.includes('inactive') ? 'inactive' : 'off_duty';
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

  const available = (data.available || []).map(iso => {
    const time = getTime(iso);
    return { time, state: 'available', period: getPeriod(time), duration };
  });

  const booked = (data.booked || []).map(iso => {
    const time = getTime(iso);
    return { time, state: 'booked', period: getPeriod(time), duration };
  });

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
  async getAll(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=500` : '?limit=500';
    const res = await api(`/patients${query}`);
    return (res.data || []).map(formatPatient);
  },

  async getById(id) {
    const res = await api(`/patients/${id}`);
    return formatPatient(res.data);
  },

  async create(patientData) {
    const res = await api('/patients', {
      method: 'POST',
      body: JSON.stringify(preparePatientPayload(patientData)),
    });
    return formatPatient(res.data);
  },

  async update(id, updates) {
    const res = await api(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(preparePatientPayload(updates)),
    });
    return formatPatient(res.data);
  },
};

export const doctorService = {
  async getAll() {
    const res = await api('/doctors?limit=100&isActive=true');
    return (res.data || []).map(formatDoctor);
  },

  async getAvailability(doctorId, date) {
    const res = await api(`/doctors/${doctorId}/availability?date=${date}`);
    return formatAvailability(res.data, res.data?.doctor?.consultationDuration || 30);
  },
};

export const appointmentService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams({ limit: '500' });
    if (filters.date) params.append('date', filters.date);
    if (filters.doctorId && filters.doctorId !== 'all') params.append('doctorId', filters.doctorId);
    if (filters.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await api(`/appointments?${params}`);
    return (res.data || []).map(formatAppointment);
  },

  async create({ patientId, doctorId, date, timeSlot, appointmentType, reason }) {
    let appointmentDate = null;
    if (date && timeSlot) {
      const [h, m] = timeSlot.split(':').map(Number);
      const [y, mo, d] = date.split('-').map(Number);
      appointmentDate = new Date(y, mo - 1, d, h, m, 0, 0).toISOString();
    }
    const res = await api('/appointments', {
      method: 'POST',
      body: JSON.stringify({ patientId, doctorId, appointmentDate, appointmentType, reason }),
    });
    return formatAppointment(res.data);
  },

  async cancel(id, reason = 'Cancelled by reception') {
    const res = await api(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return formatAppointment(res.data);
  },

  async reschedule(id, { newDate, newTimeSlot, reason = 'Rescheduled by reception' }) {
    let newDateISO = null;
    if (newDate && newTimeSlot) {
      const [h, m] = newTimeSlot.split(':').map(Number);
      const [y, mo, d] = newDate.split('-').map(Number);
      newDateISO = new Date(y, mo - 1, d, h, m, 0, 0).toISOString();
    }
    const res = await api(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newDate: newDateISO, reason }),
    });
    return formatAppointment(res.data);
  },

  async complete(id) {
    const res = await api(`/appointments/${id}/complete`, { method: 'PATCH' });
    return formatAppointment(res.data);
  },
};

export const dashboardService = {
  async getSummary() {
    const res = await api('/dashboard');
    return res.data;
  },
};
