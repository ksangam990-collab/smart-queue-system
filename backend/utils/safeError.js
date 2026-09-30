// backend/utils/safeError.js
//
// Controllers used to return raw `error.message` on 500s, which leaks Mongo
// cast errors, stack-adjacent details and internal paths. In production we
// log the real error server-side and return a generic message to the client.

export const safeMessage = (error) => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[server error]', error);
    return 'Something went wrong. Please try again later.';
  }
  return error?.message || 'Internal Server Error';
};
