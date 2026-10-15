const Appointment = require('../models/Appointment');

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getDayName = (date) => {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
};

const getAvailableSlots = async (doctor, dateStr) => {
  if (!doctor.isActive) {
    return { available: [], booked: [], reason: 'Doctor is inactive' };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const dayName = getDayName(localDate);

  const workDay = doctor.workingHours.find((wh) => wh.day === dayName);
  if (!workDay) {
    return { available: [], booked: [], reason: `Doctor does not work on ${dayName}` };
  }

  if (doctor.leaveDates.includes(dateStr)) {
    return { available: [], booked: [], reason: 'Doctor is on leave this day' };
  }

  const duration = doctor.consultationDuration || 30;
  const dayStart = toMinutes(workDay.start);
  const dayEnd = toMinutes(workDay.end);
  const now = new Date();
  const isToday = localDate.toDateString() === now.toDateString();

  const allSlots = [];
  for (let m = dayStart; m + duration <= dayEnd; m += duration) {
    const slotHour = Math.floor(m / 60);
    const slotMin = m % 60;
    const slotDate = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);

    if (isToday && slotDate <= now) continue;

    const slotEnd = m + duration;
    const inBreak = doctor.breakPeriods.some((bp) => {
      const bStart = toMinutes(bp.start);
      const bEnd = toMinutes(bp.end);
      return m < bEnd && slotEnd > bStart;
    });
    if (inBreak) continue;

    allSlots.push(slotDate);
  }

  if (allSlots.length === 0) {
    return { available: [], booked: [], reason: 'No slots generated for this day' };
  }

  const dayStartDate = new Date(year, month - 1, day, 0, 0, 0);
  const dayEndDate = new Date(year, month - 1, day, 23, 59, 59);

  const bookedAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: dayStartDate, $lte: dayEndDate },
    status: 'Scheduled',
  }).select('appointmentDate');

  const bookedTimes = new Set(
    bookedAppointments.map((a) => a.appointmentDate.getTime())
  );

  const available = [];
  const booked = [];

  for (const slot of allSlots) {
    if (bookedTimes.has(slot.getTime())) {
      booked.push(slot.toISOString());
    } else {
      available.push(slot.toISOString());
    }
  }

  return { available, booked };
};

module.exports = { getAvailableSlots, toMinutes, getDayName };
