'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { MapPin, User, LogOut } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-800">
          <MapPin className="h-6 w-6" /> Ethiopia Tours
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/destinations" className="text-sm font-medium text-gray-600 hover:text-emerald-700">Destinations</Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-emerald-700">Admin</Link>}
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.first_name}</span>
                <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><LogOut className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-emerald-700 hover:text-emerald-600">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
