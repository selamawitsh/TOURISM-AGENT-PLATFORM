'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Users, Calendar, DollarSign, MapPin, TrendingUp, Star } from 'lucide-react';

const ANALYTICS_URL = 'https://analytics-service-i0j9.onrender.com/api/v1';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${ANALYTICS_URL}/admin/analytics/dashboard`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setSummary(data?.data || data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold">Welcome back, <span className="text-amber-300">{user?.first_name}</span>!</h1>
        <p className="text-white/80 mt-2">Monitor users, bookings, and platform insights.</p>
      </section>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: summary?.total_users || 0, icon: Users, gradient: 'from-emerald-600 to-teal-600' },
          { label: 'Total Bookings', value: summary?.total_bookings || 0, icon: Calendar, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Total Revenue', value: `$${(summary?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, gradient: 'from-blue-600 to-indigo-600' },
          { label: 'Avg Rating', value: summary?.average_rating?.toFixed(1) || '0', icon: Star, gradient: 'from-yellow-500 to-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-3xl p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm uppercase text-white/70">{stat.label}</p><p className="text-4xl font-bold mt-2">{stat.value}</p></div>
              <div className="p-4 bg-white/20 rounded-2xl"><stat.icon className="w-8 h-8" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/admin/users', icon: Users, title: 'Users', desc: 'Manage accounts and roles', color: 'text-blue-600 bg-blue-100' },
          { href: '/admin/destinations', icon: MapPin, title: 'Destinations', desc: 'Create and manage tours', color: 'text-emerald-600 bg-emerald-100' },
          { href: '/admin/analytics', icon: TrendingUp, title: 'Analytics', desc: 'View platform insights', color: 'text-amber-600 bg-amber-100' },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="bg-white rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className={`p-4 rounded-2xl ${card.color} w-fit mb-4`}><card.icon className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
