// backend/utils/escapeRegex.js
//
// Escapes a user-supplied string before using it as a MongoDB $regex value.
// Without escaping, inputs like "(a+)+$" can cause catastrophic backtracking
// (ReDoS) in MongoDB's regex engine, spiking CPU on a single crafted request.

/**
 * @param {string} str - Raw user input
 * @returns {RegExp} - Safe case-insensitive regex
 */
export const safeRegex = (str) => {
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
};
