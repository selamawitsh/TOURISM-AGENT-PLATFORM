import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI} from '../services/api';
import PaymentModal from '../components/PaymentModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookings(page, 10);
      setBookings(response.data.data);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError('Failed to load bookings');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    // Redirect to confirmation page
    window.location.href = `/payment/confirmation?tx_ref=${paymentData.transaction_ref}&status=success`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Confirmed</span>;
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
      case 'cancelled':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Cancelled</span>;
      case 'completed':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Completed</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const canCancel = (status, travelDate) => {
    if (status === 'cancelled' || status === 'completed') return false;
    const travelDateObj = new Date(travelDate);
    const today = new Date();
    return travelDateObj > today;
  };

  const canPay = (status) => {
    return status === 'pending';
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-blue-100 mt-1">View and manage your tour bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bookings List */}
        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
              <Link
                to="/destinations"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Destinations
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.destination_name}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        📍 {booking.destination_city}, {booking.destination_country}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Travel Date:</span>
                          <p className="font-medium">{new Date(booking.travel_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Guests:</span>
                          <p className="font-medium">{booking.number_of_guests}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Price:</span>
                          <p className="font-medium text-blue-600">${booking.total_price}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Booked on:</span>
                          <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                      >
                        View Details
                      </button>
                      {canPay(booking.status) && (
                        <button
                          onClick={() => handlePayNow(booking)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Pay Now
                        </button>
                      )}
                      {canCancel(booking.status, booking.travel_date) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{selectedBooking.destination_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{selectedBooking.destination_city}, {selectedBooking.destination_country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Date</p>
                <p>{new Date(selectedBooking.travel_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Guests</p>
                <p>{selectedBooking.number_of_guests}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-lg font-bold text-blue-600">${selectedBooking.total_price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Booking Date</p>
                <p>{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default MyBookings;