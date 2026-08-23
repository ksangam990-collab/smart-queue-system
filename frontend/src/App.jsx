// frontend/src/App.jsx

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Profile from "./pages/Profile";

// Auth pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDepartments from "./pages/admin/ManageDepartments";
import ManageStaff from "./pages/admin/ManageStaff";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageAppointments from "./pages/admin/ManageAppointments";
import Reports from "./pages/admin/Reports";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import QueuePanel from "./pages/staff/QueuePanel";
import Schedule from "./pages/staff/Schedule";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/BookAppointment";
import MyAppointments from "./pages/customer/MyAppointments";
import LiveQueue from "./pages/customer/LiveQueue";
import FeedbackPage from "./pages/customer/Feedback";
import Notifications from "./pages/customer/Notifications";

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
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
