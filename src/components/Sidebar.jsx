import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, X, PieChart, Settings, Mail } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings } from '../services/api';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const navigate = useNavigate();
  const [brandData, setBrandData] = React.useState({ initial: 'A', url: '' });

  React.useEffect(() => {
    // Initial fetch
    getSettings().then(data => {
      if (data) setBrandData({ 
        initial: data.name.charAt(0).toUpperCase() || 'A', 
        url: data.avatarUrl || '' 
      });
    });
    
    // Auto-update function
    const fetchBrand = () => {
        getSettings().then(d => { 
            if(d) setBrandData({ 
              initial: d.name.charAt(0).toUpperCase() || 'A', 
              url: d.avatarUrl || '' 
            }); 
        });
    }

    window.addEventListener('focus', fetchBrand);
    window.addEventListener('profileUpdate', fetchBrand);
    
    return () => {
        window.removeEventListener('focus', fetchBrand);
        window.removeEventListener('profileUpdate', fetchBrand);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Analytics', icon: PieChart, path: '/analytics' },
    { label: 'Messages', icon: Mail, path: '/messages' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[var(--surface-color)] border-r border-[var(--border-color)] overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-red-500/50 overflow-hidden">
            {brandData.url ? (
              <img src={brandData.url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              brandData.initial
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Analytics
          </h1>
        </div>
        
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[#EF4444] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Overview
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md shadow-red-500/20 scale-105 origin-left"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-color)] hover:text-[var(--primary)] hover:translate-x-1"
              )
            }
          >
            <item.icon size={20} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[#FEF2F2] hover:text-[#EF4444] dark:hover:bg-red-950/30 transition-all duration-200"
        >
          <LogOut size={20} className="group-hover:stroke-current" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-[var(--sidebar-w)]">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
