'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Users, Minus, Plus, ShieldCheck, Sparkles, Loader2, Lightbulb, Tag, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';
const BOOKING_URL = 'https://booking-service-e6a5.onrender.com/api/v1';
const PAYMENT_URL = 'https://payment-service-o5ma.onrender.com/api/v1';
const AI_URL = 'https://ai-service-06yq.onrender.com/api/v1';

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

  // AI States
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetch(`${DEST_URL}/destinations/${id}`)
      .then(res => res.json())
      .then(data => {
        const dest = data?.data || data;
        setDestination(dest);
        if (dest) fetchAIRecommendation(dest);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAIRecommendation = async (dest: any) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${AI_URL}/ai/smart-booking-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_name: dest.name,
          budget: Math.round((dest.discount_price || dest.price_per_person || 500) * guests),
          group_size: guests,
          travel_date: date || '2026-06-01',
        }),
      });
      const data = await res.json();
      if (!data.error) setAiRecommendation(data);
    } catch {} finally { setAiLoading(false); }
  };

  const totalPrice = (destination?.discount_price || destination?.price_per_person || 0) * guests;

  const handleBookAndPay = async () => {
    if (!date) { setError('Please select a travel date'); return; }
    setBooking(true); setError('');
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/auth/login'); return; }

    try {
      // Step 1: Create booking
      const bookingRes = await fetch(`${BOOKING_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          destination_id: destination.id,
          travel_date: new Date(date).toISOString(),
          number_of_guests: guests,
        }),
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Booking failed');
      }

      const bookingData = await bookingRes.json();
      const bookingId = bookingData.id || bookingData.data?.id;

      // Step 2: Initialize payment via Chapa
      const paymentRes = await fetch(`${PAYMENT_URL}/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json().catch(() => ({}));
        throw new Error(err.error || 'Payment initialization failed');
      }

      const paymentData = await paymentRes.json();

      // Step 3: Redirect to Chapa checkout page
      if (paymentData.payment_url) {
        window.location.href = paymentData.payment_url;
      } else {
        router.push(`/payment/confirmation?tx_ref=${paymentData.transaction_ref}&status=pending`);
      }
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
        <Link href={`/destinations/${destination.slug || id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {destination.name}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Book Your Journey</h1>
            <p className="text-gray-600 mt-1">{destination.name} - {destination.city}, {destination.country}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><CalendarDays className="h-4 w-4" /> Travel Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Users className="h-4 w-4" /> Guests</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="p-3 rounded-lg border hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
                  <span className="text-xl font-bold w-12 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(destination.max_people || 20, guests + 1))} className="p-3 rounded-lg border hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Price per person</span><span>{formatCurrency(price)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Guests</span><span>x {guests}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-emerald-700">{formatCurrency(totalPrice)}</span></div>
            </div>

            {/* AI Toggle */}
            <button onClick={() => setShowAI(!showAI)} className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
              <Sparkles className="h-4 w-4" />{showAI ? 'Hide AI Insights' : 'Show AI Booking Insights'}
              {aiLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </button>

            {showAI && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-5 space-y-4">
                <div className="flex items-center gap-2 text-purple-700"><Sparkles className="h-5 w-5" /><h3 className="font-semibold">AI Booking Insights</h3></div>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-purple-600"><Loader2 className="h-4 w-4 animate-spin" />Generating...</div>
                ) : aiRecommendation ? (
                  <>
                    {aiRecommendation.recommended_booking && (
                      <div className="bg-white rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-700 mb-2"><Lightbulb className="h-4 w-4" />AI Recommendation</div>
                        <p className="text-sm text-gray-700">{aiRecommendation.recommended_booking.message}</p>
                      </div>
                    )}
                    {aiRecommendation.best_deals?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-700 mb-2"><Tag className="h-4 w-4" />Money-Saving Tips</div>
                        {aiRecommendation.best_deals.map((deal: any, i: number) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-purple-100 text-sm text-gray-700 mb-2">{deal.description}{deal.savings && <span className="ml-2 text-emerald-600 font-medium">Save ${deal.savings}</span>}</div>
                        ))}
                      </div>
                    )}
                    {aiRecommendation.availability_forecast && (
                      <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-purple-500" />Availability: <span className={`font-medium ${aiRecommendation.availability_forecast === 'High' ? 'text-emerald-600' : 'text-amber-600'}`}>{aiRecommendation.availability_forecast}</span></div>
                    )}
                    {aiRecommendation.tips?.length > 0 && (
                      <div><div className="text-sm font-medium text-purple-700 mb-2">Booking Tips</div><ul className="space-y-1">{aiRecommendation.tips.map((tip: string, i: number) => (<li key={i} className="text-sm text-gray-600">- {tip}</li>))}</ul></div>
                    )}
                  </>
                ) : <p className="text-sm text-gray-500">AI recommendations not available.</p>}
              </div>
            )}

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <button onClick={handleBookAndPay} disabled={booking}
              className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />{booking ? 'Processing...' : 'Book & Pay Now'}
            </button>
            <p className="text-xs text-center text-gray-400">You will be redirected to Chapa secure payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
