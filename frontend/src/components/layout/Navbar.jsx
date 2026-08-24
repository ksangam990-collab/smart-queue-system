// frontend/src/components/layout/Navbar.jsx
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const Navbar = ({ title = "Dashboard", onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    staff: "bg-blue-100 text-blue-700",
    customer: "bg-green-100 text-green-700",
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1a1a2e] border-b border-slate-100 dark:border-[#2a2a42] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
      {/* Left side: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary-500 transition-all"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-primary-500 hover:bg-primary-50 transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-1.5 sm:pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            <img
              src={user?.avatar?.url}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`;
              }}
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-none mb-0.5">
                {user?.name}
              </p>
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded-full capitalize ${roleColors[user?.role]}`}
              >
                {user?.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 max-w-[calc(100vw-1rem)] bg-white border border-slate-100 rounded-2xl shadow-card py-2 z-50"
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <Settings size={15} /> Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
