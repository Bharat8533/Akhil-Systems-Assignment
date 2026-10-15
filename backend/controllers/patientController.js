const Patient = require('../models/Patient');

const createPatient = async (req, res) => {
  const {
    fullName, dateOfBirth, gender, phone, address,
    email, bloodGroup, emergencyContact, allergies, notes,
  } = req.body;

  const possible = await Patient.findOne({
    fullName: { $regex: new RegExp(`^${fullName.trim()}$`, 'i') },
    dateOfBirth: new Date(dateOfBirth),
    phone: phone.trim(),
  });

  if (possible) {
    return res.status(409).json({
      success: false,
      message: 'A patient with the same name, date of birth, and phone already exists.',
      existingPatientId: possible.patientId,
    });
  }

  const patient = await Patient.create({
    fullName, dateOfBirth, gender, phone, address,
    email, bloodGroup, emergencyContact, allergies, notes,
  });

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully.',
    data: patient,
  });
};

const getPatients = async (req, res) => {
  const { search, gender, bloodGroup, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (gender) filter.gender = gender;
  if (bloodGroup) filter.bloodGroup = bloodGroup;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Patient.countDocuments(filter);
  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: patients,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

const getPatientById = async (req, res) => {
  const { id } = req.params;
  const patient = await Patient.findOne({
    $or: [
      ...(id.match(/^PAT-/i) ? [{ patientId: id.toUpperCase() }] : []),
      ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
  });

  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  res.json({ success: true, data: patient });
};

const updatePatient = async (req, res) => {
  const { patientId, registrationDate, _id, __v, createdAt, ...allowedUpdates } = req.body;

  const patient = await Patient.findOneAndUpdate(
    {
      $or: [
        { patientId: req.params.id.toUpperCase() },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    },
    allowedUpdates,
    { new: true, runValidators: true }
  );

  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  res.json({ success: true, message: 'Patient updated successfully.', data: patient });
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient };
