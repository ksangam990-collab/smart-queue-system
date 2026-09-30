// backend/middleware/errorMiddleware.js

// 404 handler — fires when no route matched
export const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  res.status(404);
  next(error);
};

// Global error handler — catches everything passed via next(error)
// (Express 5 also routes rejected async handlers here).
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON body / oversized payload from body-parser
  let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  if (err.type === 'entity.too.large') statusCode = 413;
  if (err.type === 'entity.parse.failed') statusCode = 400;

  const isProd = process.env.NODE_ENV === 'production';
  if (statusCode >= 500) console.error('[error]', err);

  res.status(statusCode).json({
    success: false,
    message:
      isProd && statusCode >= 500
        ? 'Something went wrong. Please try again later.'
        : err.type === 'entity.parse.failed'
          ? 'Invalid JSON in request body.'
          : err.message || 'Internal Server Error',
    stack: isProd ? undefined : err.stack,
  });
};
