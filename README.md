<div align="center">

<img src="https://img.shields.io/badge/Slotly-Smart%20Queue%20System-6366f1?style=for-the-badge&logoColor=white" alt="Slotly" />

# 🏥 Slotly — Smart Queue & Appointment Booking

**Book appointments. Track queues in real-time. Zero waiting room chaos.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge)](https://slotly.ksangam.dpdns.org)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/ksangam990-collab/smart-queue-system)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📁 Project Structure](#-project-structure)
- [👥 Roles & Permissions](#-roles--permissions)
- [🔌 API Overview](#-api-overview)
- [🔒 Security](#-security)
- [📸 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 👤 For Customers
- 📅 **Book appointments** — pick department, service & time slot in under a minute
- 🎫 **Get a queue token** instantly — no front-desk visit needed
- 📍 **Track live queue position** — real-time updates via WebSocket
- 🔔 **Smart alerts** — get notified when your turn is 2–3 positions away
- 📧 **Email confirmations** — booking, cancellation, and reminder emails
- ⭐ **Leave feedback** — rate services after completed appointments

### 🧑‍⚕️ For Staff
- 📟 **Queue panel** — call next, skip, or mark tokens as served
- 📆 **Schedule management** — set availability and working hours
- 📊 **Dashboard** — today's appointments and queue stats at a glance

### 👑 For Admins
- 🏢 **Department & service management** — full CRUD with icons and colors
- 👥 **User management** — manage customers and staff accounts
- 📈 **Analytics & reports** — weekly charts, department breakdowns, date range filters
- 💬 **Feedback overview** — ratings and comments across all departments
- 🔄 **Appointment management** — view, filter, update status on any booking

### ⚡ Platform
- 🌓 **Dark / Light mode** — system preference + manual toggle
- 📱 **Fully responsive** — mobile, tablet, and desktop
- ⚡ **Real-time** — Socket.io broadcasts queue updates to all connected clients instantly
- 🎨 **Smooth animations** — Framer Motion + Lenis smooth scroll

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Animations** | Framer Motion, Lenis |
| **Forms** | React Hook Form |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT + HTTP-only cookies |
| **Real-time** | Socket.io |
| **Email** | Resend API |
| **File Upload** | Cloudinary + Multer |
| **Security** | Helmet, express-rate-limit, bcryptjs |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Vercel)                   │
│          React 19 + Vite + Tailwind CSS             │
│                                                     │
│   Customer │ Staff │ Admin    →   Auth Context      │
│   Pages    │ Panel │ Dashboard    + Role Routes     │
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS + WebSocket (wss://)
┌──────────────────────▼──────────────────────────────┐
│                  SERVER (Render)                    │
│            Node.js + Express 5 + Socket.io          │
│                                                     │
│  Auth │ Queue │ Appointment │ User │ Notification   │
│  Routes + Controllers + Middleware                  │
└──────────────────────┬──────────────────────────────┘
                       │  Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│              MongoDB Atlas (Cloud)                  │
│  Users │ Appointments │ Queues │ Notifications      │
│  Departments │ Services │ Feedback                  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB replica set)
- Resend account (for emails)
- Cloudinary account (for avatar uploads)

### 1. Clone the repository

```bash
git clone https://github.com/ksangam990-collab/smart-queue-system.git
cd smart-queue-system
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy the example env file and fill in your values
cp .env.example .env

npm run dev   # starts on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install

# Copy the example env file and fill in your values
cp .env.example .env.local

npm run dev   # starts on http://localhost:5173
```

### 4. Open the app

```
http://localhost:5173
```

Register as a customer, or seed an admin account directly in MongoDB.

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/slotly

# JWT
JWT_SECRET=your-random-32-char-secret
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend URL (used in CORS + email links)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# Cloudinary (avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=xxxxxxxxxxxx
```

### Frontend — `frontend/.env.local`

```env
VITE_API_URL=http://localhost:5000/api

# Optional: explicit WebSocket URL (defaults to VITE_API_URL origin)
# VITE_SOCKET_URL=http://localhost:5000
```

> ⚠️ **Never commit `.env` files.** They are in `.gitignore`. Use `.env.example` as a reference.

---

## 📁 Project Structure

```
smart-queue-system/
│
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary setup
│   │   └── validateEnv.js      # Startup env validation
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── queueController.js
│   │   ├── userController.js
│   │   ├── departmentController.js
│   │   ├── serviceController.js
│   │   ├── feedbackController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT + role guard
│   │   ├── rateLimiter.js      # Per-route rate limits
│   │   ├── uploadMiddleware.js # Multer + Cloudinary
│   │   └── errorMiddleware.js  # Global error handler
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── utils/
│   │   ├── generateToken.js    # JWT + cookie helper
│   │   ├── generateQueueToken.js
│   │   ├── sendEmail.js        # Resend API + templates
│   │   ├── escapeRegex.js      # ReDoS prevention
│   │   └── ApiResponse.js
│   ├── socket.js               # Socket.io setup
│   └── server.js               # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/         # Logo, skeletons, etc.
        │   ├── home/           # Landing page components
        │   └── layout/         # DashboardLayout, Navbar, Sidebar
        ├── contexts/
        │   ├── AuthContext.jsx  # Auth state + logout
        │   └── ThemeContext.jsx # Dark/light mode
        ├── hooks/              # useAuth, useLenis, useTheme
        ├── pages/
        │   ├── admin/          # Dashboard, reports, management
        │   ├── staff/          # Queue panel, schedule
        │   ├── customer/       # Booking, appointments, live queue
        │   └── auth/           # Login, register, reset password
        ├── routes/
        │   ├── ProtectedRoute.jsx
        │   └── RoleRoute.jsx
        ├── services/
        │   ├── api.js          # Axios instance
        │   └── socket.js       # Socket.io singleton
        └── App.jsx             # Router + lazy loading
```

---

## 👥 Roles & Permissions

| Feature | Customer | Staff | Admin |
|---------|:--------:|:-----:|:-----:|
| Book appointment | ✅ | — | — |
| View own appointments | ✅ | — | — |
| Track live queue | ✅ | ✅ | ✅ |
| Submit feedback | ✅ | — | — |
| Call next / skip token | — | ✅ | ✅ |
| Manage own schedule | — | ✅ | ✅ |
| Manage all appointments | — | — | ✅ |
| Manage departments & services | — | — | ✅ |
| Manage users & staff | — | — | ✅ |
| View reports & analytics | — | — | ✅ |
| View all feedback | — | — | ✅ |

---

## 🔌 API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new customer | Public |
| `POST` | `/api/auth/login` | Login | Public |
| `POST` | `/api/auth/logout` | Logout + clear cookie | Protected |
| `POST` | `/api/auth/forgot-password` | Send reset email | Public |
| `PUT` | `/api/auth/reset-password/:token` | Reset password | Public |
| `GET` | `/api/appointments/available-slots` | Get available time slots | Protected |
| `POST` | `/api/appointments` | Book appointment | Customer |
| `GET` | `/api/appointments` | List appointments | Protected |
| `PUT` | `/api/appointments/:id/status` | Update status | Staff/Admin |
| `GET` | `/api/queue` | Get today's queue | Protected |
| `POST` | `/api/queue/call-next/:queueId` | Call next token | Staff/Admin |
| `POST` | `/api/queue/skip` | Skip a token | Staff/Admin |
| `GET` | `/api/queue/position` | Get queue position | Protected |
| `GET` | `/api/departments` | List departments | Protected |
| `GET` | `/api/users/dashboard-stats` | Admin dashboard stats | Admin |
| `GET` | `/api/users/ranged-stats` | Reports with date range | Admin |
| `GET` | `/api/feedback` | All feedback (paginated) | Admin |
| `POST` | `/api/feedback` | Submit feedback | Customer |
| `GET` | `/api/notifications` | My notifications | Protected |

---

## 🔒 Security

- 🔐 **JWT** stored in HTTP-only cookies (`sameSite: none` for cross-origin)
- 🛡️ **Helmet.js** — secure HTTP headers
- 🚦 **Rate limiting** — per-route limits on auth, password reset, email verification
- 🔑 **Cryptographically secure tokens** — `crypto.randomBytes(32)` for reset/verify tokens
- 🧹 **Input sanitization** — regex inputs escaped to prevent ReDoS attacks
- 🔄 **MongoDB transactions** — atomic booking prevents double-booking race conditions
- 🎭 **Role-based access control** — every route guarded by role middleware
- ☁️ **No secrets in code** — all credentials via environment variables

---

## 📸 Screenshots

> *Coming soon — add screenshots of the booking flow, queue panel, and admin dashboard here.*

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">

Built with ❤️ by [ksangam990-collab](https://github.com/ksangam990-collab)

⭐ **Star this repo if you find it useful!**

</div>
