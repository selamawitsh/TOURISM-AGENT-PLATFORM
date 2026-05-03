'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Users, Minus, Plus, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/destinations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDestination(data?.data || data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const totalPrice = (destination?.discount_price || destination?.price_per_person || 0) * guests;

  const handleBook = async () => {
    if (!date) {
      setError('Please select a travel date');
      return;
    }

    setBooking(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          destination_id: id,
          travel_date: date,
          guests: guests,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Booking failed');
      }

      router.push('/booking/confirmation');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!destination) return <div className="min-h-screen flex items-center justify-center text-gray-500">Destination not found</div>;

  const price = destination.discount_price || destination.price_per_person || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/destinations/${destination.slug}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {destination.name}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Book Your Journey</h1>
            <p className="text-gray-600 mt-1">{destination.name}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="h-4 w-4" /> Travel Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" /> Guests
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-12 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(destination.max_people || 20, guests + 1))}
                  className="p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per person</span>
                <span>{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Guests</span>
                <span>x {guests}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-700">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-5 w-5" />
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
