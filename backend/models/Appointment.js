const mongoose = require('mongoose');
const Counter = require('./Counter');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date/time is required'],
    },
    slotEnd: { type: Date, required: true },
    appointmentType: {
      type: String,
      enum: ['New', 'Follow-up'],
      required: [true, 'Appointment type is required'],
    },
    department: { type: String, trim: true },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    cancelledAt: { type: Date },
    cancelReason: { type: String, maxlength: [300, 'Reason cannot exceed 300 characters'] },
    rescheduledFrom: { type: Date },
    rescheduledAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Scheduled' },
    name: 'unique_active_slot',
  }
);

appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, doctor: 1, status: 1 });
appointmentSchema.index({ appointmentId: 'text' });

appointmentSchema.pre('save', async function () {
  if (this.isNew && !this.appointmentId) {
    const seq = await Counter.nextSeq('appointment');
    this.appointmentId = `APT-${String(seq).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
