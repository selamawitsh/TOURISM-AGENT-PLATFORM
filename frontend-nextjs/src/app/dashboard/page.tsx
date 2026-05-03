'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { 
  Calendar, Heart, MapPin, Star, TrendingUp, ArrowRight, CheckCircle,
  Compass, Coffee, Users, Globe, Sparkles, ChevronRight, Bell, LogOut, Home, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFeaturedDestinations } from '@/lib/api-client';

export default function CustomerDashboard() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    getFeaturedDestinations(4).then(res => {
      const d = res?.data?.data || res?.data || res || [];
      setDestinations(Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin h-14 w-14 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return null;

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/destinations', icon: Compass, label: 'Explore' },
    { path: '/my-bookings', icon: Calendar, label: 'My Bookings' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/my-reviews', icon: Star, label: 'Reviews' },
    { path: '/profile', icon: Users, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - always visible on lg, toggle on mobile */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-2.5"><Compass className="h-5 w-5 text-white" /></div>
              <span className="font-bold text-slate-900">Ethiopia Tours</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                <item.icon className="h-5 w-5" /><span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-rose-500 rounded-lg hover:bg-rose-600"><LogOut className="h-4 w-4" /> Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu className="h-5 w-5" /></button>
            <div><h1 className="text-xl font-bold text-slate-900">Dashboard</h1><p className="text-sm text-gray-500 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
          </div>
          <Link href="/destinations" className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">Explore</Link>
        </header>

        <div className="p-6 space-y-8">
          {/* Hero */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 rounded-3xl p-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4"><Sparkles className="w-4 h-4 text-amber-400" /><span className="text-sm">Welcome to Ethiopia Tours</span></div>
            <h1 className="text-3xl font-bold mb-2">Welcome, <span className="text-amber-400">{user?.first_name}</span>!</h1>
            <p className="text-white/70">Your journey through Ethiopia's breathtaking landscapes starts here.</p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Bookings', icon: Calendar, href: '/my-bookings', color: 'from-blue-500 to-cyan-500' },
              { label: 'Favorites', icon: Heart, href: '/favorites', color: 'from-rose-500 to-pink-500' },
              { label: 'Reviews', icon: Star, href: '/my-reviews', color: 'from-amber-500 to-orange-500' },
              { label: 'Profile', icon: Users, href: '/profile', color: 'from-emerald-500 to-teal-500' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all hover:-translate-y-1 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mx-auto mb-3`}><item.icon className="w-6 h-6" /></div>
                <p className="font-semibold text-slate-900">{item.label}</p>
              </Link>
            ))}
          </div>

          {/* Featured */}
          {destinations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Featured Destinations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {destinations.map((dest: any) => (
                  <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden"><img src={dest.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600'} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" /><div className="absolute bottom-2 left-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs"><Star className="w-3 h-3 text-amber-400 fill-amber-400 inline mr-1" />{dest.rating || '4.8'}</div></div>
                    <div className="p-4"><h3 className="font-semibold text-slate-900">{dest.name}</h3><p className="text-sm text-slate-500"><MapPin className="w-3 h-3 inline mr-1" />{dest.city}, {dest.country}</p><p className="text-lg font-bold text-emerald-600 mt-2">${dest.discount_price || dest.price_per_person || 0}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
