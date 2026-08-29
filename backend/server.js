// backend/server.js

import 'dotenv/config';
import { validateEnv } from './config/validateEnv.js';

// Fail fast if required env vars are missing — before any other imports
// that might silently use undefined values.
validateEnv();

import http from 'http';
import express from 'express';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { startNoShowDetector } from "./jobs/noShowDetector.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { initSocket } from "./socket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

connectDB();

const app    = express();
const server = http.createServer(app); // wrap express in http.Server for Socket.io

// ── Init Socket.io (must be before routes use emitQueueUpdate) ──
initSocket(server);

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// HTTP request logging — verbose 'dev' format locally, structured 'combined'
// in production (compatible with log aggregators like Datadog / Render logs).
// Never run 'dev' in production: it emits ANSI colours and wastes log bytes.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(generalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Slotly API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/queue",         queueRoutes);
app.use("/api/departments",   departmentRoutes);
app.use("/api/services",      serviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback",      feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use server.listen (not app.listen) so Socket.io shares the same port
server.listen(PORT, () => {
  console.log(
    `\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL?.replace(/\/$/, "") || `port ${PORT}`
      : `http://localhost:${PORT}`;
  console.log(`📡 API:    ${baseUrl}/api/health`);
  console.log(`🔌 Socket: ws://localhost:${PORT}\n`);

  // Start background jobs after server is ready
  startNoShowDetector();
});
