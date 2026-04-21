import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
  Sparkles,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Home,
  Ticket,
  MessageSquare,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
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
  const [notifications] = useState(3);

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
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Overview', active: true },
    { path: '/destinations', icon: Compass, label: 'Explore' },
    { path: '/my-bookings', icon: Calendar, label: 'My Bookings', badge: stats.upcomingTrips },
    { path: '/favorites', icon: Heart, label: 'Favorites', badge: stats.totalFavorites },
    { path: '/my-reviews', icon: Star, label: 'Reviews' },
    { path: '/profile', icon: Users, label: 'Profile' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-emerald-600"
            />
            <Compass className="absolute inset-0 m-auto h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
            Loading your journey
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="hidden lg:block w-72 h-screen sticky top-0 bg-white/98 backdrop-blur-sm ring-1 ring-slate-100 shadow-lg overflow-y-auto"
        >
          <div className="p-6">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-3 shadow-lg flex items-center justify-center">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-slate-900">Ethiopia Tours</span>
                <span className="text-xs text-slate-400">Your travel hub</span>
              </div>
            </Link>

            <nav className="mt-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                    item.active
                      ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 ring-1 ring-emerald-100 shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50 hover:shadow-sm"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    item.active ? "text-emerald-600" : "text-slate-500"
                  )} />
                  <span className="flex-1 font-medium text-sm">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white to-slate-50">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
              >
                <LogOut className="h-4 w-4 text-white" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 lg:px-8 py-4"
          >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Dashboard</h1>
                    <div className="hidden md:block text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="relative p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow">{notifications}</span>
                    )}
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
          </motion.header>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {/* Hero Banner */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 rounded-3xl overflow-hidden mb-8"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full filter blur-3xl"></div>
              </div>
              
              <div className="relative px-6 lg:px-10 py-10 lg:py-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-white/90">Welcome to Ethiopia Tours</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      Welcome back, <span className="text-amber-400">{user?.first_name}</span>!
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl">
                      Your journey through Ethiopia's breathtaking landscapes, rich culture, and unforgettable experiences starts here.
                    </p>
                  </div>
                  <Link 
                    to="/destinations" 
                    className="group bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2 self-start"
                  >
                    Explore Destinations
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
              {[
                { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
                { label: 'Saved Places', value: stats.totalFavorites, icon: Heart, bgColor: 'bg-rose-50', textColor: 'text-rose-600' },
                { label: 'Upcoming Trips', value: stats.upcomingTrips, icon: TrendingUp, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                { label: 'Completed', value: stats.completedTrips, icon: CheckCircle, bgColor: 'bg-green-50', textColor: 'text-green-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}> 
                      <stat.icon className={`${stat.textColor} w-6 h-6`} />
                    </div>
                    <div className="text-sm text-slate-400">&nbsp;</div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Recent Bookings */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
              >
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Your upcoming and past adventures</p>
                  </div>
                  <Link 
                    to="/my-bookings" 
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1 group"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition">
                                {booking.destination_name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-slate-500">
                                  {new Date(booking.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-xs text-slate-300">•</span>
                                <span className="text-sm text-slate-500">{booking.number_of_guests} guests</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
                              getStatusColor(booking.status)
                            )}>
                              {getStatusIcon(booking.status)}
                              <span className="text-xs font-medium capitalize">{booking.status}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-4">No bookings yet</p>
                      <Link 
                        to="/destinations" 
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Start exploring
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Right Column */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Ethiopian Inspiration */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Ethiopian Inspiration</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Discover the land of 13 months of sunshine, where ancient history meets breathtaking landscapes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['🏔️ Simien Mountains', '⛪ Lalibela', '🌋 Danakil', '💧 Blue Nile'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs text-slate-600 border border-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Favorites Preview */}
                {favorites.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-4 h-4 text-rose-500" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Your Favorites</h3>
                      </div>
                      <Link to="/favorites" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        See all
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {favorites.slice(0, 3).map((fav) => (
                        <Link 
                          key={fav.id} 
                          to={`/destinations/${fav.destination_name?.toLowerCase().replace(/\s+/g, '-')}`} 
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition">
                            <MapPin className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" />
                          </div>
                          <span className="text-sm text-slate-700 group-hover:text-emerald-600 transition flex-1">
                            {fav.destination_name}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Tips */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5" />
                    <h3 className="font-semibold">Travel Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Best time to visit: Oct - May',
                      'Ethiopian Birr (ETB) is local currency',
                      'Amharic is widely spoken',
                      'Visa available on arrival for many countries'
                    ].map((tip, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-300 shrink-0" />
                        <span className="text-white/90">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Recommended Destinations */}
            {recommendedDestinations.length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                    <p className="text-slate-500 mt-1">Hand-picked destinations based on your interests</p>
                  </div>
                  <Link 
                    to="/destinations" 
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1 group"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedDestinations.map((dest, index) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/destinations/${dest.slug}`} className="group block">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-slate-100">
                          <div className="relative h-52 overflow-hidden">
                            <img 
                              src={dest.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600'} 
                              alt={dest.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            
                            {dest.is_featured && (
                              <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                Featured
                              </span>
                            )}
                            
                            <div className="absolute bottom-3 left-3">
                              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs text-white font-medium">{dest.rating || '4.8'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-lg mb-1">
                              {dest.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {dest.city}, {dest.country}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-emerald-600">
                                  ${dest.price_per_person || dest.discount_price || 0}
                                </span>
                                <span className="text-xs text-slate-400"> / person</span>
                              </div>
                              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-all group-hover:scale-110">
                                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-white transition" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;