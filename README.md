# Smart Appointment & Queue Booking System

Full-stack MERN application for booking appointments and tracking live queues.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas

## Setup

### Backend
\`\`\`bash
cd backend
npm install
# create .env with MONGO_URI, JWT_SECRET, etc.
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
# create .env with VITE_API_URL
npm run dev
\`\`\`

## Features
- JWT authentication with role-based access (admin/staff/customer)
- Department & service management
- Appointment booking with time-slot generation
- Live queue tracking with auto-refresh
- Staff queue panel (call next, skip, complete)
- Notifications, feedback & ratings
- Reports with charts and CSV export

## Folder Structure
See `/backend` and `/frontend` directories — organized by controllers, routes, models, pages, components.