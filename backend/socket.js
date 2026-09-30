// backend/socket.js
// Central Socket.io setup — imported by server.js
//
// Security model:
//   - Every connection must present a valid JWT (handshake `auth.token`,
//     Authorization header, or the HTTP-only `token` cookie) for an active user.
//   - room names are built only from validated ObjectIds.
//   - Staff may only join their own department's room; customers/admins may join
//     any (queue counts are already visible to customers on the Live Queue page).
//   - Each socket is capped in rooms joined and in events per second.

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';

let io;

const MAX_ROOMS_PER_SOCKET = 3;
const MAX_EVENTS_PER_WINDOW = 20;
const WINDOW_MS = 10_000;

const parseCookie = (header = '') =>
  Object.fromEntries(
    header
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );

const extractToken = (socket) => {
  const fromAuth = socket.handshake.auth?.token;
  if (typeof fromAuth === 'string' && fromAuth) return fromAuth;

  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  const cookies = parseCookie(socket.handshake.headers?.cookie);
  return cookies.token || null;
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e4, // 10 KB — clients only ever send tiny room payloads
  });

  // ── Authenticate every connection ────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('role department isActive');
      if (!user || !user.isActive) return next(new Error('Authentication failed'));

      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
        department: user.department?.toString() || null,
      };
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const { role, department } = socket.data.user;

    // Simple per-socket flood guard
    let windowStart = Date.now();
    let count = 0;
    socket.use((_packet, next) => {
      const now = Date.now();
      if (now - windowStart > WINDOW_MS) {
        windowStart = now;
        count = 0;
      }
      if (++count > MAX_EVENTS_PER_WINDOW) return next(new Error('Rate limit exceeded'));
      next();
    });

    // Client emits: { departmentId: '...' }
    socket.on('join_queue_room', (payload) => {
      const departmentId = payload?.departmentId;
      if (typeof departmentId !== 'string' || !mongoose.isValidObjectId(departmentId)) return;

      // Staff are confined to their own department's room
      if (role === 'staff' && department && department !== departmentId) return;

      const joined = [...socket.rooms].filter((r) => r.startsWith('queue_'));
      if (joined.length >= MAX_ROOMS_PER_SOCKET) return;

      socket.join(`queue_${departmentId}`);
    });

    socket.on('leave_queue_room', (payload) => {
      const departmentId = payload?.departmentId;
      if (typeof departmentId !== 'string' || !mongoose.isValidObjectId(departmentId)) return;
      socket.leave(`queue_${departmentId}`);
    });
  });

  return io;
};

// Call this from anywhere in the backend to broadcast a queue update
export const emitQueueUpdate = (departmentId, queueData) => {
  if (!io) return;
  io.to(`queue_${departmentId}`).emit('queue_updated', queueData);
};

export const getIO = () => io;
