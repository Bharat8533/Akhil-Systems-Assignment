export const generatePatientId = (existingPatients = []) => {
  const prefix = 'PAT';
  const year = new Date().getFullYear();
  const count = existingPatients.length + 1001;
  return `${prefix}-${year}-${count}`;
};

export const generateAppointmentId = (existingAppointments = []) => {
  const prefix = 'APT';
  const year = new Date().getFullYear();
  const count = existingAppointments.length + 5001;
  return `${prefix}-${year}-${count}`;
};
