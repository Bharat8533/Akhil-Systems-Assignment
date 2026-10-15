const Doctor = require('../models/Doctor');
const { getAvailableSlots } = require('../utils/availability');

const createDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, message: 'Doctor created.', data: doctor });
};

const getDoctors = async (req, res) => {
  const { search, department, specialization, isActive, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (department) filter.department = { $regex: department, $options: 'i' };
  if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { doctorId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Doctor.countDocuments(filter);
  const doctors = await Doctor.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: doctors,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

const getDoctorById = async (req, res) => {
  const { id } = req.params;
  const doctor = await Doctor.findOne({
    $or: [
      ...(id.match(/^DOC-/i) ? [{ doctorId: id.toUpperCase() }] : []),
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, data: doctor });
};

const updateDoctor = async (req, res) => {
  const { doctorId, _id, __v, createdAt, ...allowedUpdates } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    {
      $or: [
        { doctorId: req.params.id.toUpperCase() },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    },
    allowedUpdates,
    { new: true, runValidators: true }
  );

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, message: 'Doctor updated.', data: doctor });
};

const getDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Query parameter "date" is required (YYYY-MM-DD).' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  const [y, mo, d] = date.split('-').map(Number);
  const targetMidnight = new Date(y, mo - 1, d);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  if (targetMidnight < todayMidnight) {
    return res.status(400).json({ success: false, message: 'Cannot query availability for past dates.' });
  }

  const doctor = await Doctor.findOne({
    $or: [
      ...(id.match(/^DOC-/i) ? [{ doctorId: id.toUpperCase() }] : []),
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const slots = await getAvailableSlots(doctor, date);

  res.json({
    success: true,
    data: {
      doctor: {
        doctorId: doctor.doctorId,
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        consultationDuration: doctor.consultationDuration,
      },
      date,
      ...slots,
    },
  });
};

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, getDoctorAvailability };
