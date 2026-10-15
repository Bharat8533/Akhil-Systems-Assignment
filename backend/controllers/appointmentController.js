const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { getAvailableSlots } = require('../utils/availability');

const validateSlot = async (doctor, slotISO, excludeAppointmentId = null) => {
  const slotDate = new Date(slotISO);
  const dateStr = slotISO.slice(0, 10);

  const slots = await getAvailableSlots(doctor, dateStr);
  if (slots.reason) return { valid: false, reason: slots.reason };

  const isAvail = slots.available.some(
    (s) => new Date(s).getTime() === slotDate.getTime()
  );
  if (!isAvail) {
    const isBooked = slots.booked.some(
      (s) => new Date(s).getTime() === slotDate.getTime()
    );
    if (isBooked) return { valid: false, reason: 'This slot is already booked.' };
    return { valid: false, reason: 'Selected slot is not a valid working slot for this doctor.' };
  }

  const conflict = await Appointment.findOne({
    doctor: doctor._id,
    appointmentDate: slotDate,
    status: 'Scheduled',
    ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
  });
  if (conflict) return { valid: false, reason: 'This slot is already booked (conflict detected).' };

  return { valid: true };
};

const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentType, reason } = req.body;

  const patient = await Patient.findOne({
    $or: [
      { patientId: patientId?.toUpperCase() },
      ...(patientId?.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: patientId }] : []),
    ],
    isActive: true,
  });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found or inactive.' });
  }

  const doctor = await Doctor.findOne({
    $or: [
      { doctorId: doctorId?.toUpperCase() },
      ...(doctorId?.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: doctorId }] : []),
    ],
  });
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }
  if (!doctor.isActive) {
    return res.status(400).json({ success: false, message: 'Cannot book with an inactive doctor.' });
  }

  const slotISO = new Date(appointmentDate).toISOString();
  const check = await validateSlot(doctor, slotISO);
  if (!check.valid) {
    return res.status(409).json({ success: false, message: check.reason });
  }

  const slotStart = new Date(slotISO);
  const slotEnd = new Date(slotStart.getTime() + doctor.consultationDuration * 60 * 1000);

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    appointmentDate: slotStart,
    slotEnd,
    appointmentType,
    department: doctor.department,
    reason,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'patientId fullName phone gender')
    .populate('doctor', 'doctorId name specialization department');

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    data: populated,
  });
};

const getAppointments = async (req, res) => {
  const {
    patientId, doctorId, department, status,
    date, startDate, endDate,
    search, page = 1, limit = 20,
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (department) filter.department = { $regex: department, $options: 'i' };

  if (date) {
    const [y, mo, d] = date.split('-').map(Number);
    filter.appointmentDate = {
      $gte: new Date(y, mo - 1, d, 0, 0, 0),
      $lte: new Date(y, mo - 1, d, 23, 59, 59),
    };
  } else if (startDate || endDate) {
    filter.appointmentDate = {};
    if (startDate) filter.appointmentDate.$gte = new Date(startDate);
    if (endDate) filter.appointmentDate.$lte = new Date(endDate + 'T23:59:59');
  }

  if (patientId) {
    const p = await Patient.findOne({
      $or: [
        { patientId: patientId.toUpperCase() },
        ...(patientId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: patientId }] : []),
      ],
    });
    if (p) filter.patient = p._id;
    else filter.patient = null;
  }

  if (doctorId) {
    const doc = await Doctor.findOne({
      $or: [
        { doctorId: doctorId.toUpperCase() },
        ...(doctorId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: doctorId }] : []),
      ],
    });
    if (doc) filter.doctor = doc._id;
    else filter.doctor = null;
  }

  if (search) {
    const [matchingPatients, matchingDoctors] = await Promise.all([
      Patient.find({
        $or: [
          { patientId: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id'),
      Doctor.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
    ]);
    const patientIds = matchingPatients.map(p => p._id);
    const doctorIds = matchingDoctors.map(d => d._id);

    filter.$or = [
      { appointmentId: { $regex: search, $options: 'i' } },
      ...(patientIds.length ? [{ patient: { $in: patientIds } }] : []),
      ...(doctorIds.length ? [{ doctor: { $in: doctorIds } }] : []),
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .populate('patient', 'patientId fullName phone gender age')
    .populate('doctor', 'doctorId name specialization department')
    .sort({ appointmentDate: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: appointments,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findOne({
    $or: [
      { appointmentId: id.toUpperCase() },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  })
    .populate('patient', 'patientId fullName phone gender dateOfBirth')
    .populate('doctor', 'doctorId name specialization department phone');

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  res.json({ success: true, data: appointment });
};

const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const appointment = await Appointment.findOne({
    $or: [
      { appointmentId: id.toUpperCase() },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  if (appointment.status !== 'Scheduled') {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel an appointment with status "${appointment.status}".`,
    });
  }

  appointment.status = 'Cancelled';
  appointment.cancelledAt = new Date();
  appointment.cancelReason = reason || '';
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'patientId fullName phone')
    .populate('doctor', 'doctorId name specialization department');

  res.json({ success: true, message: 'Appointment cancelled. Slot is now released.', data: populated });
};

const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  if (!newDate) {
    return res.status(400).json({ success: false, message: '"newDate" is required.' });
  }

  const appointment = await Appointment.findOne({
    $or: [
      { appointmentId: id.toUpperCase() },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  }).populate('doctor');

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  if (appointment.status !== 'Scheduled') {
    return res.status(400).json({
      success: false,
      message: `Cannot reschedule an appointment with status "${appointment.status}".`,
    });
  }

  const newSlotISO = new Date(newDate).toISOString();
  const check = await validateSlot(appointment.doctor, newSlotISO, appointment._id);
  if (!check.valid) {
    return res.status(409).json({ success: false, message: check.reason });
  }

  const newSlotStart = new Date(newSlotISO);
  const newSlotEnd = new Date(
    newSlotStart.getTime() + appointment.doctor.consultationDuration * 60 * 1000
  );

  appointment.rescheduledFrom = appointment.appointmentDate;
  appointment.rescheduledAt = new Date();
  appointment.appointmentDate = newSlotStart;
  appointment.slotEnd = newSlotEnd;
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'patientId fullName phone')
    .populate('doctor', 'doctorId name specialization department');

  res.json({ success: true, message: 'Appointment rescheduled successfully.', data: populated });
};

const completeAppointment = async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findOne({
    $or: [
      { appointmentId: id.toUpperCase() },
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  if (appointment.status !== 'Scheduled') {
    return res.status(400).json({
      success: false,
      message: `Only scheduled appointments can be marked complete.`,
    });
  }

  appointment.status = 'Completed';
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'patientId fullName phone')
    .populate('doctor', 'doctorId name specialization department');

  res.json({ success: true, message: 'Appointment marked as completed.', data: populated });
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
};
