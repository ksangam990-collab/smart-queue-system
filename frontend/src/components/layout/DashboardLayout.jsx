import { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import VerifyEmailBanner from '../common/VerifyEmailBanner';
import CustomCursor from '../home/CustomCursor';
import { useLenis } from '../../hooks/useLenis';

const DashboardLayout = ({ title, cinematic = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);

  // Only bind Lenis when this route group opts in — it targets the actual
  // scroll container (<main>) below, not the window, since the dashboard
  // shell itself never scrolls.
  useLenis(cinematic ? mainRef : undefined);

  return (
    <div className={`flex h-screen overflow-hidden bg-slate-50 ${cinematic ? 'dashboard-cinematic' : ''}`}>
      {cinematic && <CustomCursor />}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          <VerifyEmailBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
