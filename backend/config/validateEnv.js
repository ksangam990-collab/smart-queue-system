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

  // A short JWT secret can be brute-forced offline from any captured token.
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error(
      '[validateEnv] JWT_SECRET must be at least 32 characters. ' +
      "Generate one: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
  }

  // CLIENT_URL feeds CORS + Socket.io + email links. A trailing slash or a
  // missing scheme silently breaks CORS matching, so fail loudly instead.
  try {
    const u = new URL(process.env.CLIENT_URL);
    if (process.env.CLIENT_URL.endsWith('/') || !['http:', 'https:'].includes(u.protocol)) {
      throw new Error('bad');
    }
  } catch {
    throw new Error(
      `[validateEnv] CLIENT_URL must be a full origin without a trailing slash (e.g. https://slotly.ksangam.dpdns.org), got: "${process.env.CLIENT_URL}"`
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
