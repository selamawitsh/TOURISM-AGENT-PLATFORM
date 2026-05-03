'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, MapPin, Star, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/admin/analytics/dashboard`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => res.json())
      .then((data) => setSummary(data?.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

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
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-emerald-700 to-amber-500 rounded-3xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-3">Analytics Dashboard</h1>
        <p className="text-white/90 text-xl">Discover insights into Ethiopia's tourism landscape</p>
        <div className="mt-6 flex items-center space-x-2">
          <div className="w-12 h-1 bg-amber-400 rounded-full" />
          <div className="w-8 h-1 bg-emerald-400 rounded-full" />
          <div className="w-4 h-1 bg-red-400 rounded-full" />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Bookings', value: summary.total_bookings?.toLocaleString() || '0', icon: Calendar, gradient: 'from-emerald-700 to-emerald-600' },
            { label: 'Total Revenue', value: `$${(summary.total_revenue || 0).toLocaleString()}`, icon: DollarSign, gradient: 'from-amber-500 to-amber-400' },
            { label: 'Total Users', value: summary.total_users?.toLocaleString() || '0', icon: Users, gradient: 'from-blue-600 to-blue-500' },
            { label: 'Avg Rating', value: summary.average_rating?.toFixed(1) || '0', icon: Star, gradient: 'from-yellow-500 to-yellow-400' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition-transform`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold mt-3">{stat.value}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl"><stat.icon className="w-8 h-8" /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all ${activeTab === tab.id ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-600 hover:text-emerald-700'}`}>
                  <Icon className="w-5 h-5" />{tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {/* Period Selector */}
          {['bookings', 'revenue', 'users'].includes(activeTab) && (
            <div className="flex justify-end mb-8">
              <div className="inline-flex rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-white">
                {['week', 'month', 'year'].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-6 py-3 text-sm font-semibold capitalize transition-all ${period === p ? 'bg-emerald-700 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" />Booking Trends</h3>
                  <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Chart data loading...</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />User Growth</h3>
                  <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Chart data loading...</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border"><div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Booking analytics for {period}</div></div>
          )}
          {activeTab === 'revenue' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border"><div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Revenue analytics for {period}</div></div>
          )}
          {activeTab === 'destinations' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Destinations</h3>
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Destination analytics loading...</div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border"><div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">User growth for {period}</div></div>
          )}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border"><div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Review analytics loading...</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
