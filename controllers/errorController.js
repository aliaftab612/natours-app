const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
  if (err.keyValue.name) {
    const message = `Duplicate Tour Name - ${err.keyValue.name}`;
    return new AppError(message, 400);
  }
  if (err.keyValue.email) {
    const message = `User with this email already exists - ${err.keyValue.email}`;
    return new AppError(message, 400);
  }
};

const handleValidationErrorsDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  let message = `Invalid Input Data : ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      errStack: err.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    else if (err.code === 11000) err = handleDuplicateKeyErrorDB(err);
    else if (err.name === 'ValidationError')
      err = handleValidationErrorsDB(err);
    else if (err.type === 'entity.parse.failed')
      err = new AppError('Invalid JSON', 400);
    else if (err.name === 'JsonWebTokenError')
      err = new AppError('Invalid Token!', 401);
    else if (err.name === 'TokenExpiredError')
      err = new AppError('Token Expired Please Re-Login!', 401);

    if (req.originalUrl.startsWith('/api')) {
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        });
      } else {
        console.error('ERROR', err);

        return res.status(500).json({
          status: 'error',
          message: 'Something went very Wrong!',
        });
      }
    }

    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      console.error('ERROR', err);

      return res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try Again!',
      });
    }
  }
};
