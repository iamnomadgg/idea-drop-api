export const CustomError = class extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'Error';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};

export const errorHandler = (err, req, res, next) => {
  // Use the error's statusCode if it exists, otherwise use res.statusCode, otherwise default to 500
  const statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
