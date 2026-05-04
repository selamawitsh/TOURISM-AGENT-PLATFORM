'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
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
      .then(data => {
        const list = data?.data || data || [];
        setBookings(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 lg:px-10 py-8 lg:py-10 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Your Travel History</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-lg text-white/80">{bookings.length} {bookings.length === 1 ? 'journey' : 'journeys'} booked</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring destinations and book your first journey!</p>
            <Link href="/destinations" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors">
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Destination Info */}
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-100 rounded-xl p-3 hidden sm:block">
                        <MapPin className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {b.destination_name || b.destination?.name || 'Destination'}
                        </h3>
                        {(b.destination_city || b.destination?.city) && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {[b.destination_city, b.destination_country].filter(Boolean).join(', ') || 
                             [b.destination?.city, b.destination?.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                        
                        {/* Trip Details */}
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-US', { 
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                            }) : 'Date not set'}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            {b.number_of_guests || b.guests || 1} {b.number_of_guests === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>

                        {/* Booking ID */}
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                          Booking #{b.id?.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(b.total_price || 0)}</p>
                        <p className="text-xs text-gray-400">total</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(b.status)}`}>
                        {getStatusIcon(b.status)}
                        <span className="capitalize">{b.status || 'pending'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(b.status === 'pending') && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                      <Link href={`/booking/confirmation`} className="flex-1 text-center py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                        Complete Payment
                      </Link>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
