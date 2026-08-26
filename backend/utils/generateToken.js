// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';

export const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Send as HTTP-only cookie (extra security)
  // sameSite must be 'none' (not 'strict') because the frontend (Vercel) and
  // backend (Render) are on different origins — strict prevents the browser
  // from sending the cookie on cross-origin requests, which breaks all auth.
  // 'none' requires secure:true, which is already enforced in production.
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
  });

  return token;
};