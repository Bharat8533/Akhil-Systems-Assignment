const path      = require('path');
const dotenv    = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose  = require('mongoose');
const Doctor    = require('../models/Doctor');
const Counter   = require('../models/Counter');
const connectDB = require('../config/db');

const newDoctors = [
  {
    name: 'Dr. Aarav Singhania',
    specialization: 'Senior Interventional Cardiologist',
    department: 'Cardiology',
    phone: '+91-987112134',
    email: 'aarav.singhania@quickcare.in',
    consultationDuration: 30,
    workingHours: [
      { day: 'Monday',    start: '09:00', end: '17:00' },
      { day: 'Tuesday',   start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Thursday',  start: '09:00', end: '17:00' },
      { day: 'Friday',    start: '09:00', end: '15:00' },
    ],
    breakPeriods: [{ start: '13:00', end: '14:00' }],
    leaveDates: [],
    isActive: true,
  },
  {
    name: 'Dr. Devika Nambiar',
    specialization: 'Pediatric Cardiologist & Cardiac Imaging',
    department: 'Cardiology',
    phone: '+91-9872231440',
    email: 'devika.nambiar@quickcare.in',
    consultationDuration: 30,
    workingHours: [
      { day: 'Monday',    start: '10:00', end: '18:00' },
      { day: 'Wednesday', start: '10:00', end: '18:00' },
      { day: 'Friday',    start: '10:00', end: '18:00' },
      { day: 'Saturday',  start: '09:00', end: '13:00' },
    ],
    breakPeriods: [{ start: '13:30', end: '14:30' }],
    leaveDates: [],
    isActive: true,
  },
  {
    name: 'Dr. Rajeshwar Sen',
    specialization: 'Senior Joint Replacement & Spine Surgeon',
    department: 'Orthopedics',
    phone: '+91-9812354556',
    email: 'rajeshwar.sen@quickcare.in',
    consultationDuration: 40,
    workingHours: [
      { day: 'Monday',    start: '09:30', end: '17:30' },
      { day: 'Tuesday',   start: '09:30', end: '17:30' },
      { day: 'Thursday',  start: '09:30', end: '17:30' },
      { day: 'Friday',    start: '09:30', end: '17:30' },
      { day: 'Saturday',  start: '09:00', end: '13:00' },
    ],
    breakPeriods: [{ start: '13:30', end: '14:30' }],
    leaveDates: [],
    isActive: true,
  },
  {
    name: 'Dr. Meera Vasudevan',
    specialization: 'Arthroscopy, Sports Medicine & Trauma',
    department: 'Orthopedics',
    phone: '+91-9811435667',
    email: 'meera.vasudevan@quickcare.in',
    consultationDuration: 30,
    workingHours: [
      { day: 'Tuesday',   start: '10:00', end: '18:00' },
      { day: 'Wednesday', start: '10:00', end: '18:00' },
      { day: 'Thursday',  start: '10:00', end: '18:00' },
      { day: 'Saturday',  start: '10:00', end: '16:00' },
    ],
    breakPeriods: [{ start: '14:00', end: '15:00' }],
    leaveDates: [],
    isActive: true,
  },
  {
    name: 'Dr. Siddharth Deshmukh',
    specialization: 'Neonatology & Pediatric Critical Care',
    department: 'Pediatrics',
    phone: '+91-9825360768',
    email: 'siddharth.deshmukh@quickcare.in',
    consultationDuration: 20,
    workingHours: [
      { day: 'Monday',    start: '08:30', end: '16:30' },
      { day: 'Tuesday',   start: '08:30', end: '16:30' },
      { day: 'Wednesday', start: '08:30', end: '16:30' },
      { day: 'Thursday',  start: '08:30', end: '16:30' },
      { day: 'Friday',    start: '08:30', end: '14:30' },
    ],
    breakPeriods: [{ start: '12:30', end: '13:30' }],
    leaveDates: [],
    isActive: true,
  },
  {
    name: 'Dr. Ananya Roy',
    specialization: 'Stroke, Epilepsy & Neuro-vascular Medicine',
    department: 'Neurology',
    phone: '+91-9837318900',
    email: 'ananya.roy@quickcare.in',
    consultationDuration: 45,
    workingHours: [
      { day: 'Monday',    start: '09:00', end: '16:00' },
      { day: 'Wednesday', start: '09:00', end: '16:00' },
      { day: 'Friday',    start: '09:00', end: '16:00' },
      { day: 'Saturday',  start: '09:00', end: '13:00' },
    ],
    breakPeriods: [{ start: '13:00', end: '14:00' }],
    leaveDates: [],
    isActive: true,
  }
];

async function seed() {
  await connectDB();
  const deleted = await Doctor.deleteMany({});
  await Counter.deleteOne({ _id: 'doctor' });
  const created = [];
  for (const doc of newDoctors) {
    const d = await Doctor.create(doc);
    created.push(d);
  }
  created.forEach((d) => console.log(`   ${d.doctorId} - ${d.name} (${d.department} • ${d.specialization})`));
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('Failed to update doctors:', e);
  process.exit(1);
});
