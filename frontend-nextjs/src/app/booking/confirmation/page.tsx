'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const PAYMENT_URL = 'https://payment-service-o5ma.onrender.com/api/v1';

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (!txRef) { setStatus('failed'); return; }

    const token = localStorage.getItem('access_token');
    const verifyPayment = async () => {
      try {
        const res = await fetch(`${PAYMENT_URL}/payments/verify/${txRef}`, {
          headers: token ? { Authorization: 'Bearer ' + token } : {},
        });
        const data = await res.json();
        setPayment(data);
        setStatus(data.status === 'success' ? 'success' : data.status === 'pending' ? 'pending' : 'failed');
      } catch {
        setStatus('pending');
      }
    };

    verifyPayment();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' ? (
          <>
            <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-2">Your booking has been confirmed.</p>
            {payment && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Transaction Ref</span><span className="font-mono">{payment.transaction_ref?.slice(0, 16)}...</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-emerald-700">{formatCurrency(payment.amount || 0)}</span></div>
              </div>
            )}
            <div className="space-y-3">
              <Link href="/my-bookings" className="block w-full py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600">View My Bookings</Link>
              <Link href="/destinations" className="flex items-center justify-center gap-2 text-emerald-700 font-medium hover:underline">Explore more <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
            <p className="text-gray-600 mb-6">Your payment is being processed. Check your email for updates.</p>
            <div className="space-y-3">
              <Link href="/my-bookings" className="block w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600">View My Bookings</Link>
              <Link href="/destinations" className="flex items-center justify-center gap-2 text-amber-700 font-medium hover:underline">Browse more</Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">Something went wrong with your payment. Please try again.</p>
            <div className="space-y-3">
              <Link href="/my-bookings" className="block w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600">View My Bookings</Link>
              <Link href="/destinations" className="flex items-center justify-center gap-2 text-red-700 font-medium hover:underline">Try again</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
