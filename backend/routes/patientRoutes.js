const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
} = require('../controllers/patientController');

const router = express.Router();

const createRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) >= new Date()) throw new Error('Date of birth cannot be in the future');
      return true;
    }),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female or Other'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number format'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('bloodGroup').optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
];

const updateRules = [
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('phone').optional().matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('bloodGroup').optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
];

router.post('/', createRules, validate, createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.patch('/:id', updateRules, validate, updatePatient);

module.exports = router;
