// backend/socket.js
// Central Socket.io setup — imported by server.js

import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Staff / customer joins a department room to receive queue updates
    // Client emits: { departmentId: '...' }
    socket.on('join_queue_room', ({ departmentId }) => {
      if (departmentId) {
        socket.join(`queue_${departmentId}`);
      }
    });

    socket.on('leave_queue_room', ({ departmentId }) => {
      if (departmentId) {
        socket.leave(`queue_${departmentId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// Call this from anywhere in the backend to broadcast a queue update
export const emitQueueUpdate = (departmentId, queueData) => {
  if (!io) return;
  io.to(`queue_${departmentId}`).emit('queue_updated', queueData);
};

export const getIO = () => io;
