import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MapPin, Star, DollarSign, Calendar } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import BookingChart from '../../components/admin/BookingChart';
import RevenueChart from '../../components/admin/RevenueChart';
import PopularDestinations from '../../components/admin/PopularDestinations';
import UserGrowthChart from '../../components/admin/UserGrowthChart';
import ReviewAnalytics from '../../components/admin/ReviewAnalytics';
import LoadingSpinner from '../../components/admin/LoadingSpinner';

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
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-ethiopian-blue via-ethiopian-green to-ethiopian-gold rounded-3xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-3">Analytics Dashboard</h1>
        <p className="text-ethiopian-yellow/90 text-xl leading-relaxed">
          Discover insights into Ethiopia's tourism landscape and platform performance
        </p>
        <div className="mt-6 flex items-center space-x-2">
          <div className="w-12 h-1 bg-ethiopian-yellow rounded-full"></div>
          <div className="w-8 h-1 bg-ethiopian-green rounded-full"></div>
          <div className="w-4 h-1 bg-ethiopian-red rounded-full"></div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-ethiopian-green to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90 uppercase tracking-wide">Total Bookings</p>
                <p className="text-4xl font-bold mt-3">{summary.total_bookings?.toLocaleString()}</p>
                <p className="text-sm opacity-75 mt-1">Ethiopian journeys</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-ethiopian-gold to-amber-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90 uppercase tracking-wide">Total Revenue</p>
                <p className="text-4xl font-bold mt-3">${summary.total_revenue?.toLocaleString()}</p>
                <p className="text-sm opacity-75 mt-1">Economic impact</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-ethiopian-blue to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90 uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold mt-3">{summary.total_users?.toLocaleString()}</p>
                <p className="text-sm opacity-75 mt-1">Global visitors</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-ethiopian-yellow to-yellow-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90 uppercase tracking-wide">Avg Rating</p>
                <p className="text-4xl font-bold mt-3">{summary.average_rating?.toFixed(1) || '0'}</p>
                <p className="text-sm opacity-75 mt-1">Guest satisfaction</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-ethiopian-blue/5 to-ethiopian-green/5">
          <nav className="flex overflow-x-auto px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-ethiopian-blue border-b-3 border-ethiopian-green bg-white'
                      : 'text-gray-600 hover:text-ethiopian-blue hover:bg-ethiopian-yellow/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {/* Period Selector for relevant tabs */}
          {(activeTab === 'bookings' || activeTab === 'revenue' || activeTab === 'users') && (
            <div className="flex justify-end mb-8">
              <div className="inline-flex rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-white">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    period === 'week'
                      ? 'bg-ethiopian-green text-white shadow-inner'
                      : 'text-gray-700 hover:bg-ethiopian-yellow/10'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-6 py-3 text-sm font-semibold border-l border-r border-gray-200 transition-all duration-200 ${
                    period === 'month'
                      ? 'bg-ethiopian-green text-white shadow-inner'
                      : 'text-gray-700 hover:bg-ethiopian-yellow/10'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    period === 'year'
                      ? 'bg-ethiopian-green text-white shadow-inner'
                      : 'text-gray-700 hover:bg-ethiopian-yellow/10'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-ethiopian-yellow/5 rounded-2xl p-6 shadow-lg border border-ethiopian-yellow/20">
                  <h3 className="text-2xl font-bold text-ethiopian-blue mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-ethiopian-green" />
                    Recent Booking Trends
                  </h3>
                  <BookingChart period={period} />
                </div>
                <div className="bg-gradient-to-br from-white to-ethiopian-blue/5 rounded-2xl p-6 shadow-lg border border-ethiopian-blue/20">
                  <h3 className="text-2xl font-bold text-ethiopian-blue mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-ethiopian-green" />
                    User Growth
                  </h3>
                  <UserGrowthChart period={period} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-ethiopian-green/5 rounded-2xl p-6 shadow-lg border border-ethiopian-green/20">
                <h3 className="text-2xl font-bold text-ethiopian-blue mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-ethiopian-green" />
                  Popular Destinations
                </h3>
                <PopularDestinations />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-gradient-to-br from-white to-ethiopian-yellow/5 rounded-2xl p-6 shadow-lg border border-ethiopian-yellow/20">
              <BookingChart period={period} />
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="bg-gradient-to-br from-white to-ethiopian-gold/5 rounded-2xl p-6 shadow-lg border border-ethiopian-gold/20">
              <RevenueChart period={period} />
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="bg-gradient-to-br from-white to-ethiopian-green/5 rounded-2xl p-6 shadow-lg border border-ethiopian-green/20">
              <PopularDestinations />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-gradient-to-br from-white to-ethiopian-blue/5 rounded-2xl p-6 shadow-lg border border-ethiopian-blue/20">
              <UserGrowthChart period={period} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-gradient-to-br from-white to-ethiopian-yellow/5 rounded-2xl p-6 shadow-lg border border-ethiopian-yellow/20">
              <ReviewAnalytics />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default AdminAnalytics;