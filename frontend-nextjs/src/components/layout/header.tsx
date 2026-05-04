'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MapPin, User, LogOut, LayoutDashboard, Settings, Heart, CalendarDays, Star, ChevronDown } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-800">
          <MapPin className="h-6 w-6" /> Ethiopia Tours
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/destinations" className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors">Destinations</Link>
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:text-emerald-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.first_name}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border z-20 py-2 animate-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full capitalize">{user?.role}</span>
                    </div>

                    {/* Dashboard Link - PRIMARY */}
                    {isAdmin ? (
                      <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 mx-2 rounded-lg hover:bg-emerald-100 transition-colors">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    ) : (
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 mx-2 rounded-lg hover:bg-emerald-100 transition-colors">
                        <LayoutDashboard className="h-4 w-4" /> My Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link href="/my-bookings" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <CalendarDays className="h-4 w-4" /> My Bookings
                      </Link>
                      <Link href="/favorites" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4" /> Favorites
                      </Link>
                      <Link href="/my-reviews" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Star className="h-4 w-4" /> My Reviews
                      </Link>
                      <Link href="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-emerald-700 hover:text-emerald-600 transition-colors">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
