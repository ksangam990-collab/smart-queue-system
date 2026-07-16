// frontend/src/components/layout/Sidebar.jsx

import Logo from '../common/Logo';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Clock, Users,
  Building2, Briefcase, BarChart3, Bell,
  Star, ListOrdered, CalendarCheck,
  ChevronLeft, Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const adminLinks = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/departments',  icon: Building2,       label: 'Departments'  },
  { to: '/admin/staff',        icon: Briefcase,       label: 'Staff'        },
  { to: '/admin/users',        icon: Users,           label: 'Users'        },
  { to: '/admin/appointments', icon: Calendar,        label: 'Appointments' },
  { to: '/admin/reports',      icon: BarChart3,       label: 'Reports'      },
];

const staffLinks = [
  { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/staff/queue',     icon: ListOrdered,     label: 'Queue Panel' },
  { to: '/staff/schedule',  icon: CalendarCheck,   label: 'Schedule'    },
];

const customerLinks = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/book',            icon: Calendar,        label: 'Book'         },
  { to: '/my-appointments', icon: Clock,           label: 'My Bookings'  },
  { to: '/live-queue',      icon: Zap,             label: 'Live Queue'   },
  { to: '/notifications',   icon: Bell,            label: 'Notifications'},
  { to: '/feedback',        icon: Star,            label: 'Feedback'     },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'staff' ? staffLinks :
    customerLinks;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-screen bg-white dark:bg-[#1a1a2e] border-r border-slate-100 dark:border-[#2a2a42] flex flex-col sticky top-0 overflow-hidden z-40 flex-shrink-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-[#2a2a42] gap-3 flex-shrink-0">
        <Logo size={36} className="flex-shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-slate-800 text-sm"
          >
            Slotly
          </motion.span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
               ${isActive
                 ? 'bg-primary-50 text-primary-600'
                 : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
               }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronLeft size={18} />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;