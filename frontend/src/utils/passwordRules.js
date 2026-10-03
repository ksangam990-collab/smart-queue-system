// Mirrors backend/utils/passwordPolicy.js so users get instant feedback.
// The server is still the source of truth and re-validates everything.
export const PASSWORD_HINT = 'At least 8 characters, with a letter and a number';

export const validatePasswordRule = (value) => {
  if (!value || value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use at least one letter and one number';
  return true; // react-hook-form "valid"
};
