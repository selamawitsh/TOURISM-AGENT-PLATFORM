import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your journey has been booked successfully. Check your email for details.</p>
        <div className="space-y-3">
          <Link href="/my-bookings" className="block w-full py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600">
            View My Bookings
          </Link>
          <Link href="/destinations" className="flex items-center justify-center gap-2 text-emerald-700 font-medium hover:underline">
            Explore more destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
