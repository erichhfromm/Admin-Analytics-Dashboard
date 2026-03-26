import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fake auth check
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex-1 lg:ml-[var(--sidebar-w)] flex flex-col min-h-screen transition-all">
        <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Framer motion wrapper could go here, but omitted for simplicity across routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
