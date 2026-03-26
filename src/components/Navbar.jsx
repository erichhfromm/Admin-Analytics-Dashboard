import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMobileMenuToggle }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--surface-color)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-[var(--bg-color)] transition-colors text-[var(--text-main)]"
        >
          <Menu size={24} />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center bg-[var(--bg-color)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search here..."
            className="bg-transparent border-none outline-none px-3 text-sm w-64 text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-[var(--bg-color)] transition-colors text-[var(--text-muted)] hover:text-[var(--primary)]"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="relative p-2 rounded-full hover:bg-[var(--bg-color)] transition-colors text-[var(--text-muted)] hover:text-[var(--primary)]">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[var(--surface-color)]" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-[var(--text-main)]">Admin User</p>
            <p className="text-xs text-[var(--text-muted)]">admin@demo.com</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
