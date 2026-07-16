// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';

export const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Send as HTTP-only cookie (extra security)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
  });

  return token;
};