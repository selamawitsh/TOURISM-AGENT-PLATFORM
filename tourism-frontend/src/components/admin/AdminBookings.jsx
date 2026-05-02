import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import StatusBadge from './StatusBadge';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const safeLoad = async () => {
      await loadBookings();
      if (!mounted) return;
    };

    safeLoad();

    return () => {
      mounted = false;
    };
  }, [page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAllBookings(page, 20);
      setBookings(response.data.data);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError('Failed to load bookings');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    'Destination',
    'User',
    'Travel Date',
    'Guests',
    'Total',
    'Status',
    'Booked On',
    'Actions'
  ];

  const renderRow = (booking, index) => (
    <tr key={booking.id} className="hover:bg-ethiopian-yellow/10 transition-colors">
      <td className="px-6 py-4">
        <div className="font-semibold text-ethiopian-blue">{booking.destination_name}</div>
        <div className="text-sm text-gray-600">{booking.destination_city}</div>
      </td>
      <td className="px-6 py-4 text-gray-600">
        <div className="font-medium">User ID: {booking.id?.substring(0, 8)}...</div>
      </td>
      <td className="px-6 py-4 text-gray-600">
        {new Date(booking.travel_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      <td className="px-6 py-4 text-gray-600 font-medium">{booking.number_of_guests}</td>
      <td className="px-6 py-4 font-bold text-ethiopian-green">${booking.total_price}</td>
      <td className="px-6 py-4">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-6 py-4 text-gray-500 text-sm">
        {new Date(booking.booking_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => {
            setSelectedBooking(booking);
            setShowModal(true);
          }}
          className="text-ethiopian-blue hover:text-ethiopian-green font-medium transition-colors"
        >
          View Details
        </button>
      </td>
    </tr>
  );

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-ethiopian-blue via-ethiopian-green to-ethiopian-gold rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">All Bookings</h1>
        <p className="text-ethiopian-yellow/90 text-lg">Manage all platform bookings with Ethiopian hospitality</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <DataTable
          headers={headers}
          data={bookings}
          renderRow={renderRow}
          loading={loading && bookings.length === 0}
          emptyMessage="No bookings found yet. Ethiopia awaits your travelers!"
        />

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Booking ID</p>
                  <p className="font-mono text-lg text-gray-900 mt-1">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Destination</p>
                  <p className="text-xl font-bold text-ethiopian-green mt-1">{selectedBooking.destination_name}</p>
                  <p className="text-gray-600">{selectedBooking.destination_city}, {selectedBooking.destination_country}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Travel Date</p>
                  <p className="text-lg mt-1">{new Date(selectedBooking.travel_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Number of Guests</p>
                  <p className="text-2xl font-bold text-ethiopian-blue mt-1">{selectedBooking.number_of_guests}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Total Price</p>
                  <p className="text-3xl font-bold text-ethiopian-green mt-1">${selectedBooking.total_price}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Status</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Booking Date</p>
              <p className="mt-1">{new Date(selectedBooking.booking_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminBookings;