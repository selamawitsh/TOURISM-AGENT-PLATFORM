import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}! 👋</h1>
        <p className="text-gray-600 mt-2">Explore amazing tours and manage your bookings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Tours Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Tours</h3>
          <p className="text-gray-600 mb-4">Discover amazing destinations and plan your next adventure.</p>
          <Link to="/tours" className="text-blue-600 hover:text-blue-700 font-medium">
            Explore Tours →
          </Link>
        </div>

        {/* My Bookings Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
          <p className="text-gray-600 mb-4">View and manage your upcoming tour bookings.</p>
          <Link to="/bookings" className="text-blue-600 hover:text-blue-700 font-medium">
            View Bookings →
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Profile</h3>
          <p className="text-gray-600 mb-4">Update your personal information and preferences.</p>
          <Link to="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
            View Profile →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;