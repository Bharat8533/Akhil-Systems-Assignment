const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const getDashboard = async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    todayScheduled,
    todayCompleted,
    todayCancelled,
    upcomingCount,
    recentAppointments,
    statusBreakdown,
  ] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    Doctor.countDocuments({ isActive: true }),
    Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: 'Scheduled',
    }),
    Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: 'Completed',
    }),
    Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: 'Cancelled',
    }),
    Appointment.countDocuments({
      appointmentDate: { $gte: tomorrow },
      status: 'Scheduled',
    }),
    Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'patientId fullName phone')
      .populate('doctor', 'doctorId name specialization department')
      .sort({ appointmentDate: 1 })
      .limit(50),
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = {};
  statusBreakdown.forEach(({ _id, count }) => { breakdown[_id] = count; });

  res.json({
    success: true,
    data: {
      summary: {
        totalPatients,
        totalDoctors,
        today: {
          scheduled: todayScheduled,
          completed: todayCompleted,
          cancelled: todayCancelled,
          total: todayScheduled + todayCompleted + todayCancelled,
        },
        upcoming: upcomingCount,
        allTime: breakdown,
      },
      todaysAppointments: recentAppointments,
    },
  });
};

const getUpcoming = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const now = new Date();
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Appointment.countDocuments({
    appointmentDate: { $gte: now },
    status: 'Scheduled',
  });

  const appointments = await Appointment.find({
    appointmentDate: { $gte: now },
    status: 'Scheduled',
  })
    .populate('patient', 'patientId fullName phone')
    .populate('doctor', 'doctorId name specialization department')
    .sort({ appointmentDate: 1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: appointments,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

module.exports = { getDashboard, getUpcoming };
