import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, User, Moon, Sun, Monitor, LogOut, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings } from '../services/api';

const Navbar = ({ onMobileMenuToggle }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  
  const [userData, setUserData] = useState({ name: 'Admin User', email: 'admin@demo.com', avatar: 'A', avatarUrl: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh name/email when navbar mounts or settings change
    const fetch = () => {
        getSettings().then(data => {
            if (data) {
              setUserData({ 
                name: data.name, 
                email: data.email, 
                avatar: data.avatar || 'A',
                avatarUrl: data.avatarUrl || ''
              });
            }
        });
    }
    fetch();
    // Re-fetch on focus OR on custom profileUpdate event
    window.addEventListener('focus', fetch);
    window.addEventListener('profileUpdate', fetch);
    return () => {
        window.removeEventListener('focus', fetch);
        window.removeEventListener('profileUpdate', fetch);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDark = () => setIsDark(!isDark);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const notifications = [
    { id: 1, title: 'New User Registered', time: '5m ago', unread: true },
    { id: 2, title: 'Server load is high', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly Report generated', time: '2d ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--surface-color)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-[var(--bg-color)] transition-colors text-[var(--text-main)]"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center bg-[var(--bg-color)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search dashboard..."
            onChange={(e) => {
              window.dispatchEvent(new CustomEvent('globalSearch', { detail: e.target.value }));
            }}
            className="bg-transparent border-none outline-none px-3 text-sm w-64 text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 relative">
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-[var(--bg-color)] transition-colors text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-full hover:bg-[var(--bg-color)] transition-colors text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-[var(--surface-color)]" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-72 bg-[var(--surface-color)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden z-50 origin-top-right"
              >
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--text-main)] text-sm">Notifications</h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Mark all as read</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={clsx("p-4 border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-color)] transition-colors cursor-pointer", n.unread && "bg-indigo-50/50 dark:bg-indigo-500/5")}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={clsx("text-sm", n.unread ? "font-bold text-[var(--text-main)]" : "font-medium text-[var(--text-main)]")}>{n.title}</h4>
                        {n.unread && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-[var(--border-color)] bg-[var(--bg-color)]">
                  <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-[var(--text-main)]">{userData.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{userData.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-800 text-white flex items-center justify-center font-bold overflow-hidden border border-[var(--border-color)]">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                userData.avatar
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 bg-[var(--surface-color)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden z-50 origin-top-right"
              >
                <div className="p-4 border-b border-[var(--border-color)] md:hidden">
                  <p className="text-sm font-bold text-[var(--text-main)]">{userData.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{userData.email}</p>
                </div>
                <div className="p-2 box-border">
                  <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-color)] rounded-lg transition-colors">
                    <User size={16} /> My Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-color)] rounded-lg transition-colors">
                    <SettingsIcon size={16} /> Account Settings
                  </button>
                </div>
                <div className="p-2 border-t border-[var(--border-color)]">
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
