// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { hashToken } from '../models/User.js';

export const issueTokens = async (res, user) => {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Short-lived Access Token (15 min default or configured)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  // 2. 7-day cryptographically secure Refresh Token
  const rawRefreshToken = randomBytes(40).toString('hex');
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.refreshToken = hashToken(rawRefreshToken);
  user.refreshTokenExpire = refreshExpires;
  await user.save({ validateBeforeSave: false });

  // Access token cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token cookie (scoped to /api/auth)
  res.cookie('refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

export const generateToken = (res, userId, role) => {
  const isProd = process.env.NODE_ENV === 'production';
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  return token;
};