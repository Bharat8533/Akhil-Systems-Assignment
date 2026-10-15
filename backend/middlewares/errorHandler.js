const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (err.keyPattern && err.keyPattern.doctor && err.keyPattern.appointmentDate) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for the selected doctor.',
      });
    }
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
