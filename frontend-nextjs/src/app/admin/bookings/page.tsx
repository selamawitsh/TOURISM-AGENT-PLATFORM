'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { CalendarDays, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const BOOKING_URL = 'https://booking-service-e6a5.onrender.com/api/v1';

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BOOKING_URL}/admin/bookings`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setBookings(Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bookings ({bookings.length})</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">{['Booking ID', 'Destination', 'User', 'Date', 'Amount', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {bookings.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No bookings yet</td></tr>
            ) : bookings.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{b.id?.slice(0, 8)}...</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm font-medium">{b.destination?.name || 'N/A'}</span></div></td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.user?.first_name} {b.user?.last_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.travel_date ? new Date(b.travel_date).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(b.total_price)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{b.status || 'pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
