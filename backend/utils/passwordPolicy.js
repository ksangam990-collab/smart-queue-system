// backend/utils/passwordPolicy.js
//
// One place for password rules. bcrypt silently truncates input at 72 bytes,
// so longer passwords are rejected rather than giving a false sense of strength.

const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwerty123', 'qwertyuiop', 'iloveyou', 'admin123', 'welcome1', 'abc12345',
  'letmein123', 'slotly123',
]);

/** @returns {string|null} an error message, or null if the password is acceptable */
export const validatePassword = (pw, { email } = {}) => {
  if (typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (Buffer.byteLength(pw, 'utf8') > 72) return 'Password must be at most 72 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
    return 'Password must contain at least one letter and one number.';
  }
  if (COMMON.has(pw.toLowerCase())) return 'That password is too common. Please choose another.';
  if (email && pw.toLowerCase().includes(String(email).split('@')[0].toLowerCase()) && String(email).split('@')[0].length >= 4) {
    return 'Password must not contain your email name.';
  }
  return null;
};
