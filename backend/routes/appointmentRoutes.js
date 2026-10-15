const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');

const router = express.Router();

const createRules = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date/time is required')
    .isISO8601().withMessage('Appointment date must be a valid ISO 8601 date-time')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Appointment must be in the future');
      return true;
    }),
  body('appointmentType')
    .isIn(['New', 'Follow-up']).withMessage('Appointment type must be "New" or "Follow-up"'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

const rescheduleRules = [
  body('newDate')
    .notEmpty().withMessage('newDate is required')
    .isISO8601().withMessage('newDate must be a valid ISO 8601 date-time')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('New appointment date must be in the future');
      return true;
    }),
];

router.post('/', createRules, validate, createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/reschedule', rescheduleRules, validate, rescheduleAppointment);
router.patch('/:id/complete', completeAppointment);

module.exports = router;
