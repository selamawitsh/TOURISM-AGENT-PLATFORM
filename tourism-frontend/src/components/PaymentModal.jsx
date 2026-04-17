import React, { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await paymentAPI.initializePayment(booking.id);
      const { payment_url } = response.data;
      
      // Open Chapa checkout in new window
      window.open(payment_url, '_blank');
      
      // Start polling for payment status
      pollPaymentStatus(response.data.transaction_ref);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionRef) => {
    const interval = setInterval(async () => {
      try {
        const response = await paymentAPI.getPaymentStatus(transactionRef);
        if (response.data.status === 'success') {
          clearInterval(interval);
          onSuccess(response.data);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setError('Payment failed. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!loading) {
        setError('Payment verification timeout. Please check your booking status later.');
        setLoading(false);
      }
    }, 300000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{booking.destination_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Travel Date:</span>
                <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span>{booking.number_of_guests}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-blue-600">${booking.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment will be processed securely through Chapa. You can pay using:
              Telebirr, Chapa, Credit Card, or Bank Transfer.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;