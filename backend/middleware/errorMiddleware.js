// backend/middleware/errorMiddleware.js

// 404 handler — fires when no route matched
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler — catches everything passed via next(error)
export const errorHandler = (err, req, res, next) => {
  // Sometimes Express passes a 200 on an error — fix that
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};