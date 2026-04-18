import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI, favoritesAPI, destinationAPI } from '../../services/api';
import { 
  Calendar, 
  Heart, 
  MapPin, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  Compass,
  Mountain,
  Coffee,
  Camera,
  Users,
  Award,
  Globe
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendedDestinations, setRecommendedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalFavorites: 0,
    upcomingTrips: 0,
    completedTrips: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await bookingAPI.getMyBookings(1, 10);
      const bookings = bookingsRes.data.data || [];
      setRecentBookings(bookings.slice(0, 5));
      
      const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.travel_date) > new Date()).length;
      const completed = bookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.travel_date) < new Date())).length;
      
      setStats({ 
        totalBookings: bookingsRes.data.total || 0,
        totalFavorites: 0,
        upcomingTrips: upcoming,
        completedTrips: completed
      });

      const favoritesRes = await favoritesAPI.getFavorites();
      const favList = favoritesRes.data.data || [];
      setFavorites(favList.slice(0, 4));
      setStats(prev => ({ ...prev, totalFavorites: favList.length }));

      const destRes = await destinationAPI.getFeaturedDestinations(4);
      setRecommendedDestinations(destRes.data || []);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Stunning Gradient with Pattern */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full filter blur-3xl"></div>
        </div>
        <div className="relative px-6 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white/90">Welcome to Ethiopia Tours</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                  Welcome back, <span className="text-amber-400">{user?.first_name}</span>
                </h1>
                <p className="text-lg text-white/80 max-w-2xl">
                  Your journey through Ethiopia's breathtaking landscapes, rich culture, and unforgettable experiences starts here.
                </p>
              </div>
              <div className="flex gap-4">
                <Link to="/destinations" className="group bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2">
                  Explore Destinations
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards with Icons */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
              <p className="text-sm text-gray-500 mt-1">Saved Destinations</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              <p className="text-sm text-gray-500 mt-1">Upcoming Adventures</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.completedTrips}</p>
              <p className="text-sm text-gray-500 mt-1">Memories Made</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                    <p className="text-sm text-gray-500 mt-1">Your upcoming and past adventures</p>
                  </div>
                  <Link to="/my-bookings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="p-6 hover:bg-gray-50 transition group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition">
                                {booking.destination_name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500">{new Date(booking.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{booking.number_of_guests} guests</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              <span className={`text-sm capitalize ${
                                booking.status === 'confirmed' ? 'text-green-600 font-medium' :
                                booking.status === 'pending' ? 'text-amber-600' :
                                'text-gray-500'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No bookings yet</p>
                      <Link to="/destinations" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700">
                        Start exploring →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Quick Actions */}
            <div className="space-y-6">
              {/* Ethiopian Inspiration Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Ethiopian Inspiration</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Discover the land of 13 months of sunshine, where ancient history meets breathtaking landscapes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-gray-600">🏔️ Simien Mountains</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-gray-600">⛪ Lalibela</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-gray-600">🌋 Danakil</span>
                  <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-gray-600">💧 Blue Nile</span>
                </div>
              </div>

              {/* Favorites Preview */}
              {favorites.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="font-semibold text-gray-900">Your Favorites</h3>
                    </div>
                    <Link to="/favorites" className="text-xs text-emerald-600 hover:text-emerald-700">
                      See all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {favorites.slice(0, 3).map((fav) => (
                      <Link key={fav.id} to={`/destinations/${fav.destination_name?.toLowerCase().replace(/\s+/g, '-')}`} 
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition">
                          <MapPin className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition flex-1">
                          {fav.destination_name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-emerald-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-semibold">Travel Tips</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-300" />
                    <span>Best time to visit: Oct - May</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-300" />
                    <span>Ethiopian Birr (ETB) is local currency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-300" />
                    <span>Amharic is widely spoken</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Destinations */}
          {recommendedDestinations.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                  <p className="text-gray-500 mt-1">Hand-picked destinations based on your interests</p>
                </div>
                <Link to="/destinations" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedDestinations.map((dest) => (
                  <Link key={dest.id} to={`/destinations/${dest.slug}`} className="group">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                      <div className="relative h-52 overflow-hidden">
                        <img 
                          src={dest.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600'} 
                          alt={dest.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        {dest.is_featured && (
                          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-white font-medium">{dest.rating || 'New'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition text-lg mb-1">
                          {dest.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{dest.city}, {dest.country}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-emerald-600">${dest.price_per_person}</span>
                            <span className="text-xs text-gray-400"> / person</span>
                          </div>
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition">
                            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;