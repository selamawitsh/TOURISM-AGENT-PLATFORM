import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AgentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}! 🎫</h1>
        <p className="text-gray-600 mt-2">Manage client bookings and tour operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Bookings Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Bookings</h3>
          <p className="text-gray-600 mb-4">View and manage all customer bookings.</p>
          <Link to="/agent/bookings" className="text-blue-600 hover:text-blue-700 font-medium">
            Manage Bookings →
          </Link>
        </div>

        {/* Client List Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client List</h3>
          <p className="text-gray-600 mb-4">View all registered customers.</p>
          <Link to="/agent/clients" className="text-blue-600 hover:text-blue-700 font-medium">
            View Clients →
          </Link>
        </div>

        {/* Tours Management Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Tours</h3>
          <p className="text-gray-600 mb-4">Create and update tour packages.</p>
          <Link to="/agent/tours" className="text-blue-600 hover:text-blue-700 font-medium">
            Manage Tours →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;