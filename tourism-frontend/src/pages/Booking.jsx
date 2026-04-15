import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI, bookingAPI } from '../services/api';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    travel_date: '',
    number_of_guests: 1,
    special_requests: '',
    contact_phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDestination();
  }, [id, isAuthenticated]);

  const loadDestination = async () => {
    try {
      console.log('Loading destination with ID:', id);
      const response = await destinationAPI.getDestinationById(id);
      console.log('Destination loaded:', response.data);
      setDestination(response.data);
    } catch (err) {
      console.error('Error loading destination:', err);
      setError('Destination not found. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    if (!destination) return 0;
    return destination.price_per_person * formData.number_of_guests;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate travel date
    if (!formData.travel_date) {
      setError('Please select a travel date');
      setSubmitting(false);
      return;
    }

    const travelDate = new Date(formData.travel_date);
    if (isNaN(travelDate.getTime())) {
      setError('Invalid travel date');
      setSubmitting(false);
      return;
    }

    const bookingData = {
      destination_id: id,
      travel_date: travelDate.toISOString(),
      number_of_guests: parseInt(formData.number_of_guests, 10),
      special_requests: formData.special_requests || '',
      contact_phone: formData.contact_phone || '',
    };

    console.log('Sending booking data:', bookingData);

    try {
      const response = await bookingAPI.createBooking(bookingData);
      console.log('Booking response:', response.data);
      setSuccess(`Booking confirmed! Booking ID: ${response.data.id}`);
      
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create booking';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !destination) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/destinations')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destination Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
            <img
              src={destination?.main_image || 'https://via.placeholder.com/400x300?text=Destination'}
              alt={destination?.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{destination?.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                📍 {destination?.city}, {destination?.country}
              </p>
              <p className="text-gray-600 text-sm mb-3">{destination?.short_description}</p>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{destination?.duration} days</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-semibold capitalize">{destination?.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per person:</span>
                  <span className="font-semibold text-blue-600">${destination?.price_per_person}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    name="travel_date"
                    value={formData.travel_date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    name="number_of_guests"
                    value={formData.number_of_guests}
                    onChange={handleChange}
                    required
                    min="1"
                    max={destination?.max_people || 20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max {destination?.max_people || 20} people
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder={user?.phone || 'Your phone number'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requirements or requests?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${destination?.price_per_person} × {formData.number_of_guests} {formData.number_of_guests === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-gray-900">${(destination?.price_per_person || 0) * formData.number_of_guests}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;