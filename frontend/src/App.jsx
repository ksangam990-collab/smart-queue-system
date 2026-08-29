// frontend/src/App.jsx

import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// ── Route-level lazy imports ──────────────────────────────────────────────────
// Each page chunk is only downloaded when the user first navigates to it.
// Customers never download admin/staff bundles; admins never download customer
// pages they don't visit. Reduces initial bundle size significantly.

// Shared
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Terms   = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

// Public / auth
const Home           = lazy(() => import("./pages/Home"));
const Login          = lazy(() => import("./pages/auth/Login"));
const Register       = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword  = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail    = lazy(() => import("./pages/auth/VerifyEmail"));
const EmailNotVerified = lazy(() => import("./pages/auth/EmailNotVerified"));

// Admin
const AdminDashboard     = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageDepartments  = lazy(() => import("./pages/admin/ManageDepartments"));
const ManageStaff        = lazy(() => import("./pages/admin/ManageStaff"));
const ManageUsers        = lazy(() => import("./pages/admin/ManageUsers"));
const ManageAppointments = lazy(() => import("./pages/admin/ManageAppointments"));
const Reports            = lazy(() => import("./pages/admin/Reports"));
const AdminFeedback      = lazy(() => import("./pages/admin/AdminFeedback"));

// Staff
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const QueuePanel     = lazy(() => import("./pages/staff/QueuePanel"));
const Schedule       = lazy(() => import("./pages/staff/Schedule"));

// Customer
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const BookAppointment   = lazy(() => import("./pages/customer/BookAppointment"));
const MyAppointments    = lazy(() => import("./pages/customer/MyAppointments"));
const LiveQueue         = lazy(() => import("./pages/customer/LiveQueue"));
const FeedbackPage      = lazy(() => import("./pages/customer/Feedback"));
const Notifications     = lazy(() => import("./pages/customer/Notifications"));

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const ThemedToaster = () => {
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  return (
    <Toaster
      position={isMobile ? "bottom-center" : "bottom-right"}
      containerStyle={isMobile ? { bottom: 20, left: 12, right: 12 } : undefined}
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: isMobile ? "10px" : "16px",
          fontFamily: "Inter, sans-serif",
          fontSize: isMobile ? "12px" : "14px",
          fontWeight: 500,
          padding: isMobile ? "8px 12px" : "14px 18px",
          maxWidth: isMobile ? "calc(100vw - 24px)" : "380px",
          background: isDark ? "#1a1a2e" : "#ffffff",
          color: isDark ? "#e2e8f0" : "#1e293b",
          border: isDark ? "1px solid #2a2a42" : "1px solid #e2e8f0",
          boxShadow: isDark
            ? "0 8px 30px rgba(0, 0, 0, 0.4)"
            : "0 8px 30px rgba(0, 0, 0, 0.08)",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: isDark ? "#1a1a2e" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: isDark ? "#1a1a2e" : "#ffffff",
          },
        },
      }}
    />
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />
        {/* Suspense is required for React.lazy — shows nothing while a page chunk loads.
            The transition is instant on fast connections; on slow ones a brief blank
            is acceptable. Add a skeleton fallback here if needed in future. */}
        <Suspense fallback={null}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/verify-pending" element={<EmailNotVerified />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout title="Profile" />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* Admin */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route element={<DashboardLayout title="Admin Dashboard" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/departments"
                  element={<ManageDepartments />}
                />
                <Route path="/admin/staff" element={<ManageStaff />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route
                  path="/admin/appointments"
                  element={<ManageAppointments />}
                />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/feedback" element={<AdminFeedback />} />
              </Route>
            </Route>

            {/* Staff */}
            <Route element={<RoleRoute allowedRoles={["staff"]} />}>
              <Route element={<DashboardLayout title="Staff Panel" />}>
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/staff/queue" element={<QueuePanel />} />
                <Route path="/staff/schedule" element={<Schedule />} />
              </Route>
            </Route>

            {/* Customer */}
            <Route element={<RoleRoute allowedRoles={["customer"]} />}>
              <Route element={<DashboardLayout title="My Dashboard" cinematic />}>
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/book" element={<BookAppointment />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/live-queue" element={<LiveQueue />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
