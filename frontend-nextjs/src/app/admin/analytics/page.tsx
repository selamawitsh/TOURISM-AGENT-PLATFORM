'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { TrendingUp, Users, MapPin, Star, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ANALYTICS_URL = 'https://analytics-service-i0j9.onrender.com/api/v1';

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState<any>(null);
  const [bookings, setBookings] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [destinations, setDestinations] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: 'Bearer ' + token };
    
    Promise.all([
      fetch(`${ANALYTICS_URL}/admin/analytics/dashboard`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${ANALYTICS_URL}/admin/analytics/bookings?period=${period}`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${ANALYTICS_URL}/admin/analytics/revenue?period=${period}`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${ANALYTICS_URL}/admin/analytics/popular-destinations?limit=10`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${ANALYTICS_URL}/admin/analytics/user-growth?period=${period}`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${ANALYTICS_URL}/admin/analytics/reviews`, { headers }).then(r => r.json()).catch(() => ({})),
    ]).then(([summaryData, bookingData, revenueData, destData, userData, reviewData]) => {
      setSummary(summaryData?.data || summaryData || {});
      setBookings(bookingData?.data || bookingData || {});
      setRevenue(revenueData?.data || revenueData || {});
      setDestinations(destData?.data || destData || {});
      setUserGrowth(userData?.data || userData || {});
      setReviews(reviewData?.data || reviewData || {});
    }).finally(() => setLoading(false));
  }, [token, period]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  const maxBookingCount = Math.max(...(bookings?.data?.map((b: any) => b.count) || [1]), 1);
  const maxRevenue = Math.max(...(revenue?.data?.map((r: any) => r.revenue) || [1]), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-emerald-700 to-amber-500 rounded-3xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-white/80">Detailed platform insights and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Bookings', value: summary?.total_bookings || 0, icon: Calendar, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Revenue', value: formatCurrency(summary?.total_revenue || 0), icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
          { label: 'Users', value: summary?.total_users || 0, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Destinations', value: summary?.total_destinations || 0, icon: MapPin, color: 'bg-purple-50 text-purple-700' },
          { label: 'Avg Rating', value: (summary?.average_rating || 0).toFixed(1), icon: Star, color: 'bg-yellow-50 text-yellow-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className={`p-3 rounded-xl ${stat.color} w-fit mb-3`}><stat.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-600 hover:text-emerald-700'
                }`}>
                <tab.icon className="w-5 h-5" />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Period Selector */}
          {['bookings', 'revenue', 'users'].includes(activeTab) && (
            <div className="flex justify-end mb-6">
              <div className="inline-flex rounded-xl border overflow-hidden">
                {['week', 'month', 'year'].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-5 py-2 text-sm font-medium capitalize transition-colors ${period === p ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bookings Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Booking Trends ({period})</h3>
                <div className="flex items-end gap-1 h-48">
                  {(bookings?.data || []).map((b: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors"
                        style={{ height: `${Math.max(4, (b.count / maxBookingCount) * 170)}px` }} />
                      <span className="text-xs text-gray-500">{b.date?.slice(5)}</span>
                      <span className="text-xs font-medium">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Destinations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Popular Destinations</h3>
                <div className="space-y-3">
                  {(destinations?.destinations || []).slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">{i + 1}</span>
                        <div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.city}, {d.country}</p></div>
                      </div>
                      <div className="text-right"><p className="font-semibold">{d.booking_count} bookings</p><p className="text-xs text-emerald-600">{formatCurrency(d.total_revenue)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{bookings?.total_bookings || 0}</p><p className="text-xs text-gray-500">Total</p></div>
                <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-700">{bookings?.confirmed_bookings || 0}</p><p className="text-xs text-gray-500">Confirmed</p></div>
                <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-700">{bookings?.cancelled_bookings || 0}</p><p className="text-xs text-gray-500">Cancelled</p></div>
                <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-700">{bookings?.completed_bookings || 0}</p><p className="text-xs text-gray-500">Completed</p></div>
              </div>
              <div className="flex items-end gap-1 h-48">
                {(bookings?.data || []).map((b: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${Math.max(4, (b.count / maxBookingCount) * 170)}px` }} />
                    <span className="text-xs text-gray-500">{b.date?.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50 rounded-xl p-4"><p className="text-2xl font-bold text-amber-700">{formatCurrency(revenue?.total_revenue || 0)}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
                <div className="bg-emerald-50 rounded-xl p-4"><p className="text-2xl font-bold text-emerald-700">{formatCurrency(revenue?.average_order || 0)}</p><p className="text-xs text-gray-500">Avg Order Value</p></div>
              </div>
              <div className="flex items-end gap-1 h-48">
                {(revenue?.data || []).map((r: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-500 rounded-t" style={{ height: `${Math.max(4, (r.revenue / maxRevenue) * 170)}px` }} />
                    <span className="text-xs text-gray-500">{r.date?.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destinations Tab */}
          {activeTab === 'destinations' && (
            <div className="space-y-3">
              {(destinations?.destinations || []).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">{i + 1}</span>
                    <div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.city}, {d.country}</p></div>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div><p className="font-semibold text-gray-900">{d.booking_count}</p><p className="text-xs text-gray-500">Bookings</p></div>
                    <div><p className="font-semibold text-emerald-600">{formatCurrency(d.total_revenue)}</p><p className="text-xs text-gray-500">Revenue</p></div>
                    <div><p className="font-semibold text-amber-600">{d.average_rating?.toFixed(1) || 'N/A'}</p><p className="text-xs text-gray-500">Rating</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-700">{(userGrowth?.total_users || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Total Users</p></div>
                <div className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-700">{userGrowth?.new_users || 0}</p><p className="text-xs text-gray-500">New ({period})</p></div>
              </div>
              <div className="flex items-end gap-1 h-48">
                {(userGrowth?.data || []).map((u: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max(4, (u.new_users / Math.max(...(userGrowth?.data?.map((x:any) => x.new_users) || [1]), 1)) * 170)}px` }} />
                    <span className="text-xs text-gray-500">{u.date?.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-xl p-4"><p className="text-2xl font-bold text-yellow-700">{reviews?.total_reviews || 0}</p><p className="text-xs text-gray-500">Total Reviews</p></div>
                <div className="bg-amber-50 rounded-xl p-4"><p className="text-2xl font-bold text-amber-700">{(reviews?.average_rating || 0).toFixed(1)}</p><p className="text-xs text-gray-500">Average Rating</p></div>
              </div>
              {reviews?.rating_distribution && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-8 text-sm font-medium text-gray-600">{rating} stars</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                          <div className="bg-amber-400 h-4 rounded-full" style={{ width: `${(reviews.rating_distribution[rating] || 0) / Math.max(reviews.total_reviews || 1, 1) * 100}%` }} />
                        </div>
                        <span className="w-8 text-sm text-gray-500 text-right">{reviews.rating_distribution[rating] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
