import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  LogOut,
  UserRound,
  Heart,
  Star,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Container = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

export const PrimaryButton = ({ children, asChild = false, to, onClick, className = '', ...props }) => {
  const base = 'inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-700';
  if (asChild && to) return (
    <Link to={to} className={`${base} ${className}`} {...props}>{children}</Link>
  );
  return (
    <button onClick={onClick} className={`${base} ${className}`} {...props}>{children}</button>
  );
};

export const SecondaryButton = ({ children, onClick, className = '', ...props }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 ${className}`} {...props}>{children}</button>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search destinations...' }) => (
  <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-2 w-full max-w-md">
    <Search className="w-4 h-4 text-slate-400" />
    <input value={value} onChange={onChange} placeholder={placeholder} className="bg-transparent outline-none text-sm text-slate-700 w-full" />
  </div>
);

export const Footer = () => (
  <footer className="mt-12 border-t bg-white/50">
    <Container className="py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Ethiopia Tours</p>
            <p className="text-xs text-slate-500">Highlands • Heritage • Hospitality</p>
          </div>
        </div>

        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Ethiopia Tours — Crafted with care.</div>
      </div>
    </Container>
  </footer>
);

const NavItem = ({ to, label, Icon }) => (
  <Link to={to} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 inline-flex items-center gap-2">
    {Icon && <Icon className="w-4 h-4" />}
    <span>{label}</span>
  </Link>
);

export const NavBar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/60 transition ${scrolled ? 'backdrop-blur-md bg-white/50' : ''}`}>
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <Link to={isAuthenticated ? '/customer/dashboard' : '/'} className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <Compass className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-heading font-semibold text-slate-900">Ethiopia Tours</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {!loading && isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3 bg-slate-100 rounded-full px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">{user?.first_name?.[0]}</div>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Login</Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-3 py-1.5 text-sm font-semibold">Get Started</Link>
              </>
            )}

            <button className="md:hidden inline-flex items-center p-2 rounded-full bg-slate-50 border" onClick={() => setOpen(!open)} aria-label="menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="md:hidden border-t bg-white">
          <Container className="py-3">
            <div className="flex flex-col gap-2">
              {!loading && isAuthenticated ? (
                <>
                  <Link to="/my-bookings" className="py-2 px-3 rounded-md text-slate-700 hover:bg-slate-50">My Bookings</Link>
                  <Link to="/favorites" className="py-2 px-3 rounded-md text-slate-700 hover:bg-slate-50">Favorites</Link>
                  <button onClick={handleLogout} className="w-full inline-flex justify-center rounded-full bg-red-50 text-red-700 px-3 py-2">Sign out</button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 inline-flex justify-center rounded-full border px-4 py-2">Login</Link>
                  <Link to="/register" className="flex-1 inline-flex justify-center rounded-full bg-emerald-600 text-white px-4 py-2">Sign up</Link>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default {
  Container,
  PrimaryButton,
  SecondaryButton,
  SearchInput,
  Footer,
  NavBar,
};
