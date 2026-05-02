import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Download, Mail } from 'lucide-react';
import { paymentAPI } from '../services/api';

const BookingConfirmation = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txRef = params.get('tx_ref');
    

    if (txRef) {
      verifyPayment(txRef);
    } else {
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [location]);

  const verifyPayment = async (txRef) => {
    try {
      const response = await paymentAPI.verifyPayment(txRef);
      if (isMountedRef.current) setPaymentStatus(response.data);
    } catch (err) {
      console.error('Failed to verify payment:', err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    alert('Invoice download will be available soon');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Payment</h2>
        <p className="text-gray-600 mb-6">
          Your booking has been created. Please complete the payment to confirm your booking.
        </p>
        <Link to="/my-bookings" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          View My Bookings
        </Link>
      </div>
    );
  }

  const isSuccess = paymentStatus.status === 'success';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-center ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          {isSuccess ? (
            <>
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">Payment Successful!</h2>
              <p className="text-green-600 mt-2">Your booking has been confirmed.</p>
            </>
          ) : (
            <>
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-800">Payment Failed</h2>
              <p className="text-red-600 mt-2">Something went wrong with your payment.</p>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono">{paymentStatus.booking_id?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Reference:</span>
                <span className="font-mono text-xs">{paymentStatus.transaction_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-blue-600">${paymentStatus.amount}</span>
              </div>
              {paymentStatus.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span>{new Date(paymentStatus.paid_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {isSuccess && (
            <div className="space-y-3">
              <button
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
              
              <button
                onClick={() => window.location.href = 'mailto:?subject=Booking%20Confirmation'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Mail className="w-4 h-4" />
                Email Confirmation
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              to="/my-bookings"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition"
            >
              View My Bookings
            </Link>
            <Link
              to="/destinations"
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition"
            >
              Browse More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;