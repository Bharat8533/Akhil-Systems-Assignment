const express = require('express');
const { getDashboard, getUpcoming } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', getDashboard);
router.get('/upcoming', getUpcoming);

module.exports = router;
