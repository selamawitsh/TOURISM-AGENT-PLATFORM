import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, MapPin, TrendingUp, Star } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../../components/admin/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await analyticsAPI.getDashboardSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={loadSummary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl border border-ethiopian-green/20 bg-gradient-to-br from-ethiopian-blue via-ethiopian-green to-ethiopian-gold p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-ethiopian-green">ET</span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-ethiopian-yellow">Admin Dashboard</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-8 h-1 bg-ethiopian-yellow rounded-full"></div>
                  <div className="w-4 h-1 bg-ethiopian-green rounded-full"></div>
                  <div className="w-2 h-1 bg-ethiopian-red rounded-full"></div>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Welcome back, <span className="text-ethiopian-yellow">{user?.first_name}</span>!
            </h1>
            <p className="text-ethiopian-yellow/90 text-xl leading-relaxed max-w-2xl">
              Monitor users, bookings, and platform insights with a refined administrator view.
              Ethiopia's tourism landscape is thriving under your guidance.
            </p>
          </div>
          <div className="lg:flex-shrink-0">
            <div className="bg-white/15 backdrop-blur-sm rounded-3xl px-8 py-6 text-white shadow-xl border border-white/20">
              <p className="text-sm font-semibold uppercase tracking-wide text-ethiopian-yellow">Your Role</p>
              <p className="mt-3 text-2xl font-bold text-white capitalize">{user?.role}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-ethiopian-green rounded-full animate-pulse"></div>
                <span className="text-sm text-ethiopian-yellow/80">Active Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards - Now using real data from backend */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-green via-emerald-600 to-teal-600 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">Total Users</p>
              <p className="text-4xl font-bold">{summary?.total_users?.toLocaleString() || '0'}</p>
              <p className="text-sm text-emerald-200">Global visitors to Ethiopia</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
              <Users className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-ethiopian-yellow to-ethiopian-gold"></div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-gold via-amber-500 to-orange-500 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">Total Bookings</p>
              <p className="text-4xl font-bold">{summary?.total_bookings?.toLocaleString() || '0'}</p>
              <p className="text-sm text-amber-200">Ethiopian adventures booked</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
              <Calendar className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-ethiopian-green to-ethiopian-blue"></div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-blue via-blue-600 to-indigo-600 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Total Revenue</p>
              <p className="text-4xl font-bold">${summary?.total_revenue?.toLocaleString() || '0'}</p>
              <p className="text-sm text-blue-200">Economic contribution</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
              <DollarSign className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-ethiopian-yellow to-ethiopian-red"></div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-ethiopian-yellow via-yellow-500 to-amber-500 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-yellow-100">Average Rating</p>
              <p className="text-4xl font-bold">{summary?.average_rating?.toFixed(1) || '0'}</p>
              <p className="text-sm text-yellow-200">Guest satisfaction</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
              <Star className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-ethiopian-green to-ethiopian-blue"></div>
        </div>
      </div>

      {/* Additional Stats Row - More detailed metrics */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-purple-100 rounded-2xl">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-xs text-gray-400">Platform Stats</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Total Destinations</h3>
          <p className="text-4xl font-bold text-purple-600">{summary?.total_destinations?.toLocaleString() || '0'}</p>
          <p className="text-sm text-gray-500 mt-2">Available tours across Ethiopia</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-orange-100 rounded-2xl">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <span className="text-xs text-gray-400">Recent Activity</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Bookings</h3>
          <p className="text-4xl font-bold text-orange-600">{summary?.recent_bookings?.reduce((sum, item) => sum + item.count, 0) || '0'}</p>
          <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-red-100 rounded-2xl">
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
            <span className="text-xs text-gray-400">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pending Payments</h3>
          <p className="text-4xl font-bold text-red-600">{summary?.pending_payments?.toLocaleString() || '0'}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting confirmation</p>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/users"
          className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ethiopian-blue/5 to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-ethiopian-blue/10 rounded-2xl group-hover:bg-ethiopian-blue/20 transition-colors duration-300">
                <Users className="w-8 h-8 text-ethiopian-blue" />
              </div>
              <TrendingUp className="w-5 h-5 text-ethiopian-green opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-ethiopian-blue transition-colors duration-300">
              User Management
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Manage user accounts, roles, and permissions across the platform. Ensure every traveler has the best Ethiopian experience.
            </p>
            <div className="flex items-center text-ethiopian-blue font-semibold group-hover:text-ethiopian-green transition-colors duration-300">
              Manage Users
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/destinations"
          className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ethiopian-green/5 to-ethiopian-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-ethiopian-green/10 rounded-2xl group-hover:bg-ethiopian-green/20 transition-colors duration-300">
                <MapPin className="w-8 h-8 text-ethiopian-green" />
              </div>
              <TrendingUp className="w-5 h-5 text-ethiopian-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-ethiopian-green transition-colors duration-300">
              Destination Management
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create, edit, and manage tour destinations and packages. Showcase Ethiopia's rich heritage and natural wonders.
            </p>
            <div className="flex items-center text-ethiopian-green font-semibold group-hover:text-ethiopian-blue transition-colors duration-300">
              Manage Destinations
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ethiopian-gold/5 to-ethiopian-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-ethiopian-gold/10 rounded-2xl group-hover:bg-ethiopian-gold/20 transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-ethiopian-gold" />
              </div>
              <Star className="w-5 h-5 text-ethiopian-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-ethiopian-gold transition-colors duration-300">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              View platform insights and key performance metrics. Track Ethiopia's tourism growth and success stories.
            </p>
            <div className="flex items-center text-ethiopian-gold font-semibold group-hover:text-ethiopian-green transition-colors duration-300">
              View Analytics
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Popular Destinations Section */}
      {summary?.popular_destinations && summary.popular_destinations.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Popular Destinations</h2>
              <p className="text-gray-500 mt-1">Most booked tours this year</p>
            </div>
            <Link to="/admin/destinations" className="text-ethiopian-blue hover:text-ethiopian-green text-sm font-semibold">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.popular_destinations.slice(0, 5).map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{dest.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dest.city}, {dest.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {dest.booking_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${dest.total_revenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ethiopian Cultural Footer */}
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-ethiopian-green/10 via-ethiopian-yellow/10 to-ethiopian-red/10 rounded-2xl px-8 py-4">
          <span className="text-2xl">🇪🇹</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-ethiopian-blue">Proudly Ethiopian</p>
            <p className="text-xs text-gray-600">Celebrating 13 months of sunshine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;