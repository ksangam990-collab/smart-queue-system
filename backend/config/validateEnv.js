// backend/config/validateEnv.js
//
// Called once at server startup. Throws immediately if any required
// environment variable is missing or obviously misconfigured, so
// deployment failures are loud and obvious instead of silently broken.

const REQUIRED = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'JWT_COOKIE_EXPIRE',
  'CLIENT_URL',
  'RESEND_API_KEY',
  'EMAIL_FROM',
];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[validateEnv] Missing required environment variables:\n  ${missing.join('\n  ')}\n\n` +
      `Copy backend/.env.example to backend/.env and fill in all values.`
    );
  }

  // Sanity-check numeric values that produce silent NaN bugs if unset
  const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE, 10);
  if (isNaN(cookieExpire) || cookieExpire <= 0) {
    throw new Error(
      `[validateEnv] JWT_COOKIE_EXPIRE must be a positive integer (days), got: "${process.env.JWT_COOKIE_EXPIRE}"`
    );
  }

  // Warn about Cloudinary — missing means avatar uploads silently fail
  const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingCloudinary = cloudinaryVars.filter((k) => !process.env[k]);
  if (missingCloudinary.length > 0) {
    console.warn(
      `[validateEnv] Warning: Cloudinary vars not set — avatar uploads will fail:\n  ${missingCloudinary.join('\n  ')}`
    );
  }
};
