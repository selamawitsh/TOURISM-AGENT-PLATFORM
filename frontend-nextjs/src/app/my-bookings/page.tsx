'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const BOOKING_URL = 'https://booking-service-e6a5.onrender.com/api/v1';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    fetch(`${BOOKING_URL}/bookings`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setBookings(Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="h-5 w-5" /> Back to Dashboard</Link>
        <div className="flex items-center gap-3 mb-6"><CalendarDays className="h-8 w-8 text-emerald-700" /><h1 className="text-3xl font-bold text-gray-900">My Bookings</h1></div>
        {loading ? <p className="text-gray-500">Loading...</p> : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border"><CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No bookings yet</p></div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-white rounded-xl p-5 border flex items-center justify-between">
                <div><h3 className="font-semibold text-gray-900">{b.destination?.name || 'Destination'}</h3><p className="text-sm text-gray-500"><MapPin className="h-3 w-3 inline mr-1" />{b.destination?.city || ''}</p></div>
                <div className="text-right"><p className="font-bold text-emerald-700">{formatCurrency(b.total_price)}</p><span className={`text-xs px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.status || 'pending'}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
