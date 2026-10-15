import { timeToMinutes, minutesToTime, getDayOfWeek, getTodayDateString } from './dateUtils';

export const calculateDoctorSlots = (doctor, dateString, appointmentsForDoctor = []) => {
  if (!doctor) {
    return { status: 'error', message: 'No doctor selected', slots: [], summary: {} };
  }

  if (doctor.isActive === false) {
    return {
      status: 'inactive',
      message: `${doctor.name} is currently inactive in the roster.`,
      slots: [],
      summary: { total: 0, available: 0, booked: 0 }
    };
  }

  const isOnLeave = (doctor.leaveDates || []).some(leaveDate => {
    if (typeof leaveDate === 'string') return leaveDate === dateString;
    if (leaveDate.from && leaveDate.to) {
      return dateString >= leaveDate.from && dateString <= leaveDate.to;
    }
    return false;
  });

  if (isOnLeave) {
    return {
      status: 'on_leave',
      message: `${doctor.name} is on approved medical/personal leave on this date.`,
      slots: [],
      summary: { total: 0, available: 0, booked: 0 }
    };
  }

  const dayName = getDayOfWeek(dateString);
  const workingDays = doctor.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (!workingDays.includes(dayName)) {
    return {
      status: 'off_duty',
      message: `${doctor.name} does not have OPD clinic hours on ${dayName}s.`,
      slots: [],
      summary: { total: 0, available: 0, booked: 0 }
    };
  }

  const workingHours = doctor.workingHours || { start: '09:00', end: '17:00' };
  const duration = doctor.consultationDuration || 15;

  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);

  const breaks = doctor.breakPeriods || [{ start: '13:00', end: '14:00', label: 'Lunch Break' }];

  const activeBookings = (appointmentsForDoctor || []).filter(
    apt => apt.status !== 'Cancelled'
  );

  const bookedTimeSlots = new Set(
    activeBookings.map(apt => apt.timeSlot || apt.time)
  );

  const todayStr = getTodayDateString();
  const isToday = dateString === todayStr;
  const now = new Date();
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  let availableCount = 0;
  let bookedCount = 0;

  for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
    const slotTime24 = minutesToTime(m);
    const slotEndTime24 = minutesToTime(m + duration);

    const breakOverlap = breaks.find(b => {
      const bStart = timeToMinutes(b.start);
      const bEnd = timeToMinutes(b.end);
      return m < bEnd && (m + duration) > bStart;
    });

    const isPast = isToday && m < currentMinutesNow;
    const isBooked = bookedTimeSlots.has(slotTime24);

    let slotState = 'available';
    let reason = '';

    if (breakOverlap) {
      slotState = 'break';
      reason = breakOverlap.label || 'Doctor Break';
    } else if (isPast) {
      slotState = 'past';
      reason = 'Past time slot';
    } else if (isBooked) {
      slotState = 'booked';
      reason = 'Already booked';
      bookedCount++;
    } else {
      availableCount++;
    }

    let period = 'morning';
    if (m >= 720 && m < 960) period = 'afternoon';
    else if (m >= 960) period = 'evening';

    slots.push({
      time: slotTime24,
      endTime: slotEndTime24,
      state: slotState,
      period,
      reason,
      duration
    });
  }

  return {
    status: 'available',
    message: `${availableCount} slots available for ${doctor.name} on ${dateString}`,
    slots,
    summary: {
      total: slots.length,
      available: availableCount,
      booked: bookedCount,
      breaks: slots.filter(s => s.state === 'break').length
    }
  };
};

export const validateSlotBooking = (doctor, dateString, slotTime, existingAppointments = []) => {
  if (!doctor || !dateString || !slotTime) {
    return { valid: false, message: 'Missing doctor, date, or slot selection' };
  }

  const { status, message, slots } = calculateDoctorSlots(doctor, dateString, existingAppointments);
  if (status !== 'available') {
    return { valid: false, message };
  }

  const targetSlot = slots.find(s => s.time === slotTime);
  if (!targetSlot) {
    return { valid: false, message: `Selected time ${slotTime} is outside doctor's consultation hours.` };
  }

  if (targetSlot.state === 'break') {
    return { valid: false, message: `Cannot book: Doctor is on scheduled break (${targetSlot.reason}).` };
  }

  if (targetSlot.state === 'past') {
    return { valid: false, message: 'Cannot book: This time slot has already passed.' };
  }

  if (targetSlot.state === 'booked') {
    return { valid: false, message: 'Conflict detected: This slot has already been booked by another patient.' };
  }

  return { valid: true, slot: targetSlot };
};
