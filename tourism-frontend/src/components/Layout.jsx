import React from 'react';
import { NavBar, Footer } from './ui/designSystem';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <NavBar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;