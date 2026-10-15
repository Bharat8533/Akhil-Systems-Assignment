const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://akhil-systems-assignment.onrender.com/api';

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    });
    clearTimeout(timerId);

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = json.message
        || (json.errors && json.errors.map(e => e.message).join(', '))
        || `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return json;
  } catch (err) {
    clearTimeout(timerId);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please check if the server is running.');
    throw err;
  }
}

function normalizePatient(p) {
  if (!p) return null;

  const allergiesStr = Array.isArray(p.allergies)
    ? (p.allergies.join(', ') || 'None reported')
    : (p.allergies || 'None reported');

  return {
    id: p.patientId || p._id,
    _id: p._id,
    fullName: p.fullName,
    dob: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : '',
    age: p.age ?? null,
    gender: p.gender,
    phone: p.phone,
    email: p.email || '',
    address: p.address,
    bloodGroup: p.bloodGroup || '',
    emergencyContact: p.emergencyContact || {},
    emergencyContactName: p.emergencyContact?.name || '',
    emergencyContactPhone: p.emergencyContact?.phone || '',
    allergies: allergiesStr,
    medicalNotes: p.notes || '',
    registeredAt: p.registrationDate || p.createdAt,
    isActive: p.isActive !== false,
  };
}

function normalizeDoctor(d) {
  if (!d) return null;

  const workingDays = (d.workingHours || []).map(wh => wh.day);
  const starts = (d.workingHours || []).map(wh => wh.start).sort();
  const ends = (d.workingHours || []).map(wh => wh.end).sort();

  return {
    id: d.doctorId || d._id,
    _id: d._id,
    name: d.name,
    specialization: d.specialization,
    department: d.department,
    qualification: d.qualification || d.specialization,
    phone: d.phone || '',
    email: d.email || '',
    avatar: d.avatar || d.image || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg',
    consultationDuration: d.consultationDuration || 30,
    isActive: d.isActive !== false,
    roomNo: d.roomNo || '',
    experience: d.experience || '',
    leaveDates: d.leaveDates || [],
    workingDays,
    workingHours: {
      start: starts[0] || '09:00',
      end: ends[ends.length - 1] || '17:00',
    },
    workingHoursArray: d.workingHours || [],
    breakPeriods: (d.breakPeriods || []).map(bp => ({
      start: bp.start,
      end: bp.end,
      label: bp.label || 'Break',
    })),
  };
}

function normalizeAppointment(apt) {
  if (!apt) return null;

  const dateObj = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
  const dateStr = dateObj
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    : '';
  const timeSlot = dateObj
    ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
    : '';

  const patient = typeof apt.patient === 'object' && apt.patient ? apt.patient : {};
  const doctor = typeof apt.doctor === 'object' && apt.doctor ? apt.doctor : {};

  return {
    id: apt.appointmentId || apt._id,
    _id: apt._id,
    patientId: patient.patientId || '',
    patientName: patient.fullName || '',
    patientPhone: patient.phone || '',
    doctorId: doctor.doctorId || '',
    doctorName: doctor.name || '',
    department: doctor.department || apt.department || '',
    date: dateStr,
    timeSlot,
    appointmentType: apt.appointmentType,
    reason: apt.reason || '',
    status: apt.status,
    cancelReason: apt.cancelReason || '',
    cancelledAt: apt.cancelledAt || null,
    createdAt: apt.createdAt,
  };
}

function normalizeAvailability(data, duration = 30) {
  if (!data) return null;

  const { available = [], booked = [], reason } = data;

  if (reason) {
    const r = reason.toLowerCase();
    if (r.includes('leave')) return { status: 'on_leave', message: reason, slots: [], summary: { available: 0, booked: 0 } };
    if (r.includes('inactive')) return { status: 'inactive', message: reason, slots: [], summary: { available: 0, booked: 0 } };
    if (r.includes('not work') || r.includes('does not work')) return { status: 'off_duty', message: reason, slots: [], summary: { available: 0, booked: 0 } };
    return { status: 'off_duty', message: reason, slots: [], summary: { available: 0, booked: 0 } };
  }

  const isoToHHMM = iso => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const period = hhmm => {
    const h = parseInt(hhmm, 10);
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  };

  const availSlots = available.map(iso => {
    const time = isoToHHMM(iso);
    return { time, state: 'available', period: period(time), duration };
  });
  const bookedSlots = booked.map(iso => {
    const time = isoToHHMM(iso);
    return { time, state: 'booked', period: period(time), duration };
  });

  const slots = [...availSlots, ...bookedSlots].sort((a, b) => a.time.localeCompare(b.time));

  return {
    slots,
    summary: { available: availSlots.length, booked: bookedSlots.length },
  };
}

function toBackendPatient(f) {
  return {
    fullName: f.fullName?.trim(),
    dateOfBirth: f.dob,
    gender: f.gender,
    phone: f.phone?.trim(),
    address: f.address?.trim(),
    email: f.email?.trim() || undefined,
    bloodGroup: f.bloodGroup || undefined,
    emergencyContact: (f.emergencyContactName || f.emergencyContact?.name) ? {
      name: (f.emergencyContactName || f.emergencyContact?.name)?.trim(),
      phone: (f.emergencyContactPhone || f.emergencyContact?.phone)?.trim(),
    } : undefined,
    allergies: f.allergies && f.allergies !== 'None reported'
      ? f.allergies.split(',').map(a => a.trim()).filter(Boolean)
      : [],
    notes: f.medicalNotes?.trim() || undefined,
  };
}

function toBackendAppointment(f) {
  let appointmentDate = null;
  if (f.date && f.timeSlot) {
    const [h, m] = f.timeSlot.split(':').map(Number);
    const [y, mo, d] = f.date.split('-').map(Number);
    appointmentDate = new Date(y, mo - 1, d, h, m, 0, 0).toISOString();
  }
  return {
    patientId: f.patientId,
    doctorId: f.doctorId,
    appointmentDate,
    appointmentType: f.appointmentType,
    reason: f.reason,
  };
}

export const patientService = {
  async getAll(query = '') {
    const qs = query ? `?search=${encodeURIComponent(query)}&limit=500` : '?limit=500';
    const res = await request(`/patients${qs}`);
    return (res.data || []).map(normalizePatient);
  },

  async getById(id) {
    const res = await request(`/patients/${id}`);
    return normalizePatient(res.data);
  },

  async create(patientData) {
    const res = await request('/patients', {
      method: 'POST',
      body: JSON.stringify(toBackendPatient(patientData)),
    });
    return normalizePatient(res.data);
  },

  async update(id, updates) {
    const res = await request(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendPatient(updates)),
    });
    return normalizePatient(res.data);
  },
};

export const doctorService = {
  async getAll() {
    const res = await request('/doctors?limit=100&isActive=true');
    return (res.data || []).map(normalizeDoctor);
  },

  async getAvailability(doctorId, dateString) {
    const res = await request(`/doctors/${doctorId}/availability?date=${dateString}`);
    const data = res.data;
    const duration = data?.doctor?.consultationDuration || 30;
    return normalizeAvailability(data, duration);
  },
};

export const appointmentService = {
  async getAll(filters = {}) {
    const p = new URLSearchParams({ limit: '500' });
    if (filters.date) p.append('date', filters.date);
    if (filters.doctorId && filters.doctorId !== 'all') p.append('doctorId', filters.doctorId);
    if (filters.department && filters.department !== 'all') p.append('department', filters.department);
    if (filters.status && filters.status !== 'all') p.append('status', filters.status);
    if (filters.search) p.append('search', filters.search);

    const res = await request(`/appointments?${p}`);
    return (res.data || []).map(normalizeAppointment);
  },

  async create(appointmentData) {
    const res = await request('/appointments', {
      method: 'POST',
      body: JSON.stringify(toBackendAppointment(appointmentData)),
    });
    return normalizeAppointment(res.data);
  },

  async cancel(id, cancelReason = 'Cancelled by reception') {
    const res = await request(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: cancelReason }),
    });
    return normalizeAppointment(res.data);
  },

  async reschedule(id, { newDate, newTimeSlot, reason = 'Rescheduled by reception' }) {
    let newDateISO = null;
    if (newDate && newTimeSlot) {
      const [h, m] = newTimeSlot.split(':').map(Number);
      const [y, mo, d] = newDate.split('-').map(Number);
      newDateISO = new Date(y, mo - 1, d, h, m, 0, 0).toISOString();
    }
    const res = await request(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newDate: newDateISO, reason }),
    });
    return normalizeAppointment(res.data);
  },

  async complete(id) {
    const res = await request(`/appointments/${id}/complete`, { method: 'PATCH' });
    return normalizeAppointment(res.data);
  },
};

export const dashboardService = {
  async getSummary() {
    const res = await request('/dashboard');
    return res.data;
  },
};
