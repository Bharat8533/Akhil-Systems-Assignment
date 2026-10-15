const mongoose = require('mongoose');
const Counter = require('./Counter');

const breakSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end:   { type: String, required: true },
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  start: { type: String, required: true },
  end:   { type: String, required: true },
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, unique: true },

    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg',
    },
    consultationDuration: { type: Number, default: 30, min: [5, 'Min 5 min'], max: [240, 'Max 240 min'] },
    workingHours: [workingHoursSchema],
    breakPeriods: [breakSchema],
    leaveDates: [{ type: String, match: [/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ name: 'text', specialization: 'text', department: 'text' });
doctorSchema.index({ department: 1, isActive: 1 });

doctorSchema.pre('save', async function () {
  if (this.isNew && !this.doctorId) {
    const seq = await Counter.nextSeq('doctor');
    this.doctorId = `DOC-${String(seq).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
