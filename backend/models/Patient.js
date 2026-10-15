const mongoose = require('mongoose');
const Counter = require('./Counter');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/, 'Invalid email format'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null, ''],
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, match: [/^\+?[\d\s\-().]{7,20}$/, 'Invalid emergency phone'] },
      relationship: { type: String, trim: true },
    },
    allergies: [{ type: String, trim: true }],
    notes: { type: String, maxlength: [1000, 'Notes cannot exceed 1000 characters'] },
    registrationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const m = today.getMonth() - this.dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) age--;
  return age;
});

patientSchema.index({ fullName: 'text', phone: 1 });
patientSchema.index({ fullName: 1, dateOfBirth: 1, phone: 1 });

patientSchema.pre('save', async function () {
  if (this.isNew && !this.patientId) {
    const seq = await Counter.nextSeq('patient');
    this.patientId = `PAT-${String(seq).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Patient', patientSchema);
