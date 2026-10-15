export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
};

export const formatDate = (dateString, options = { withDay: false }) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (options.withDay) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '—';
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString;
  }
  const [hoursStr, minutesStr] = timeString.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.padStart(2, '0') : '00';
  if (isNaN(hours)) return timeString;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayOfWeek = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

export const timeToMinutes = (time24) => {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
