const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorAvailability,
} = require('../controllers/doctorController');

const router = express.Router();

const createRules = [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('consultationDuration').optional().isInt({ min: 5, max: 240 })
    .withMessage('Consultation duration must be between 5 and 240 minutes'),
  body('workingHours').isArray({ min: 1 }).withMessage('At least one working day must be provided'),
  body('workingHours.*.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day'),
  body('workingHours.*.start').matches(/^\d{2}:\d{2}$/).withMessage('Start must be HH:MM'),
  body('workingHours.*.end').matches(/^\d{2}:\d{2}$/).withMessage('End must be HH:MM'),
];

router.post('/', createRules, validate, createDoctor);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);
router.patch('/:id', updateDoctor);

module.exports = router;
