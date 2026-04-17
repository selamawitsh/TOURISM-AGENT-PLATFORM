import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MapPin, Star, DollarSign, Calendar } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import BookingChart from '../../components/admin/BookingChart';
import RevenueChart from '../../components/admin/RevenueChart';
import PopularDestinations from '../../components/admin/PopularDestinations';
import UserGrowthChart from '../../components/admin/UserGrowthChart';
import ReviewAnalytics from '../../components/admin/ReviewAnalytics';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await analyticsAPI.getDashboardSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your platform's performance and growth</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Bookings</p>
                <p className="text-3xl font-bold mt-2">{summary.total_bookings?.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">${summary.total_revenue?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-3xl font-bold mt-2">{summary.total_users?.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">{summary.average_rating?.toFixed(1) || '0'}</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Period Selector for relevant tabs */}
          {(activeTab === 'bookings' || activeTab === 'revenue' || activeTab === 'users') && (
            <div className="flex justify-end mb-6">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    period === 'week'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${
                    period === 'month'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                    period === 'year'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Booking Trends</h3>
                  <BookingChart period={period} />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                  <UserGrowthChart period={period} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
                <PopularDestinations />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <BookingChart period={period} />
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <RevenueChart period={period} />
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <PopularDestinations />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <UserGrowthChart period={period} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <ReviewAnalytics />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;