// frontend/src/services/socket.js
// Singleton socket connection — import this anywhere in the frontend

import { io } from 'socket.io-client';

// Prefer a dedicated VITE_SOCKET_URL env var. Fall back to stripping the
// '/api' suffix from VITE_API_URL, but do it robustly with a URL object
// rather than a fragile string replace (which breaks if '/api' appears
// elsewhere in the path). In development, default to localhost.
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) {
    try {
      const url = new URL(import.meta.env.VITE_API_URL);
      // Remove the /api path segment, keep origin (scheme + host + port)
      return url.origin;
    } catch {
      // Malformed VITE_API_URL — fall through to default
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

const socket = io(SOCKET_URL, {
  autoConnect: false,      // connect manually when needed
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

export default socket;
