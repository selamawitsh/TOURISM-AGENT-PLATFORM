'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Users, Calendar, DollarSign, MapPin, TrendingUp, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const USER_URL = 'https://user-service-4dzu.onrender.com/api/v1';
const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';
const BOOKING_URL = 'https://booking-service-e6a5.onrender.com/api/v1';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ users: 0, destinations: 0, bookings: 0, bookingsList: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: 'Bearer ' + token };

    Promise.all([
      fetch(`${USER_URL}/admin/users`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${DEST_URL}/destinations?page_size=100`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${BOOKING_URL}/admin/bookings`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([usersData, destData, bookingData]) => {
      const usersList = usersData?.data || [];
      const destList = destData?.data?.data || destData?.data || [];
      const bookingsList = bookingData?.data?.data || bookingData?.data || [];
      setStats({
        users: Array.isArray(usersList) ? usersList.length : 0,
        destinations: Array.isArray(destList) ? destList.length : 0,
        bookings: Array.isArray(bookingsList) ? bookingsList.length : 0,
        bookingsList: Array.isArray(bookingsList) ? bookingsList : [],
      });
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-500 p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold">Welcome back, <span className="text-amber-300">{user?.first_name}</span>!</h1>
        <p className="text-white/80 mt-2">Monitor users, bookings, and platform insights.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, gradient: 'from-emerald-600 to-teal-600' },
          { label: 'Total Bookings', value: stats.bookings, icon: Calendar, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Total Destinations', value: stats.destinations, icon: MapPin, gradient: 'from-blue-600 to-indigo-600' },
          { label: 'Avg Rating', value: '4.8', icon: Star, gradient: 'from-yellow-500 to-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-3xl p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm uppercase text-white/70">{stat.label}</p><p className="text-4xl font-bold mt-2">{stat.value}</p></div>
              <div className="p-4 bg-white/20 rounded-2xl"><stat.icon className="w-8 h-8" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      {stats.bookingsList.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings ({stats.bookingsList.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">{['Booking ID', 'Destination', 'Date', 'Amount', 'Status'].map(h => <th key={h} className="py-3 px-4 font-medium">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {stats.bookingsList.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{b.id?.slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium">{b.destination_name || b.destination?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{b.travel_date ? new Date(b.travel_date).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{formatCurrency(b.total_price || 0)}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{b.status || 'pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/admin/users', icon: Users, title: 'Users', desc: 'Manage accounts and roles', color: 'text-blue-600 bg-blue-100' },
          { href: '/admin/destinations', icon: MapPin, title: 'Destinations', desc: 'Create and manage tours', color: 'text-emerald-600 bg-emerald-100' },
          { href: '/admin/analytics', icon: TrendingUp, title: 'Analytics', desc: 'Detailed reports and charts', color: 'text-amber-600 bg-amber-100' },
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
