import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingAPI } from '../services/api';
import { PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import PaymentModal from '../components/PaymentModal';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  Ban,
  Sparkles,
  Compass,
  TrendingUp,
  Filter,
  Download,
  Search,
  MoreVertical,
  ArrowRight,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookings();
  }, [page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookings(page, 10);
      setBookings(response.data.data);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError('Failed to load bookings');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    window.location.href = `/payment/confirmation?tx_ref=${paymentData.transaction_ref}&status=success`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { 
        label: 'Confirmed', 
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      },
      pending: { 
        label: 'Pending', 
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200' 
      },
      cancelled: { 
        label: 'Cancelled', 
        icon: XCircle,
        className: 'bg-rose-50 text-rose-700 border-rose-200' 
      },
      completed: { 
        label: 'Completed', 
        icon: CheckCircle,
        className: 'bg-blue-50 text-blue-700 border-blue-200' 
      }
    };

    const config = statusConfig[status] || { 
      label: status, 
      icon: AlertCircle,
      className: 'bg-slate-50 text-slate-700 border-slate-200' 
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border",
        config.className
      )}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const canCancel = (status, travelDate) => {
    if (status === 'cancelled' || status === 'completed') return false;
    const travelDateObj = new Date(travelDate);
    const today = new Date();
    return travelDateObj > today;
  };

  const canPay = (status) => {
    return status === 'pending';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = !searchTerm || 
      booking.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination_city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed' && new Date(b.travel_date) > new Date()).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
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
            <Calendar className="absolute inset-0 m-auto h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
            Loading your bookings
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="relative px-6 lg:px-10 py-8 lg:py-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full filter blur-3xl"></div>
              </div>
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-white/90">Your Travel History</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Bookings</h1>
                    <p className="text-lg text-white/80">
                      View and manage your Ethiopian adventures
                    </p>
                  </div>
                  
                  <Link
                    to="/destinations"
                    className="group bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2 self-start"
                  >
                    <Compass className="w-5 h-5" />
                    Explore More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {bookings.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
              { label: 'Upcoming Trips', value: stats.upcoming, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
              { label: 'Total Spent', value: `$${stats.totalSpent}`, icon: DollarSign, color: 'from-purple-500 to-pink-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                    stat.color
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          {bookings.length > 0 && (
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by destination or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {bookings.length === 0 ? 'No bookings yet' : 'No matching bookings'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {bookings.length === 0 
                    ? "You haven't made any bookings yet. Start exploring Ethiopia's amazing destinations!"
                    : 'Try adjusting your filters to see more results.'}
                </p>
                {bookings.length === 0 && (
                  <PrimaryButton asChild to="/destinations" className="px-6 py-3">
                    <span className="flex items-center gap-2">
                      <Compass className="w-5 h-5" />
                      Browse Destinations
                    </span>
                  </PrimaryButton>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    variants={itemVariants}
                    layout
                    className="group bg-slate-50/50 rounded-2xl p-5 lg:p-6 hover:shadow-lg transition-all border border-slate-100 hover:border-emerald-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      {/* Destination Image */}
                      <div className="lg:w-32 h-24 lg:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                        <img
                          src={booking.destination_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=200'}
                          alt={booking.destination_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                              {booking.destination_name}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {booking.destination_city}, {booking.destination_country}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {new Date(booking.travel_date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{booking.number_of_guests} guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-emerald-600">${booking.total_price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:self-center">
                        <SecondaryButton
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="p-2 lg:px-4 lg:py-2"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 lg:mr-2" />
                          <span className="hidden lg:inline">Details</span>
                        </SecondaryButton>
                        
                        {canPay(booking.status) && (
                          <PrimaryButton 
                            onClick={() => handlePayNow(booking)} 
                            className="p-2 lg:px-4 lg:py-2"
                          >
                            <CreditCard className="w-4 h-4 lg:mr-2" />
                            <span className="hidden lg:inline">Pay Now</span>
                          </PrimaryButton>
                        )}
                        
                        {canCancel(booking.status, booking.travel_date) && (
                          <SecondaryButton
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="p-2 lg:px-4 lg:py-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                            title="Cancel Booking"
                          >
                            {cancelling === booking.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full"
                              />
                            ) : (
                              <>
                                <Ban className="w-4 h-4 lg:mr-2" />
                                <span className="hidden lg:inline">Cancel</span>
                              </>
                            )}
                          </SecondaryButton>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && filteredBookings.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-medium transition-all",
                      page === i + 1
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{selectedBooking.destination_name}</h3>
                    <p className="text-slate-500 text-sm">
                      {selectedBooking.destination_city}, {selectedBooking.destination_country}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Travel Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedBooking.travel_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Guests</p>
                    <p className="font-medium text-slate-900">{selectedBooking.number_of_guests} people</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Price</p>
                    <p className="text-xl font-bold text-emerald-600">${selectedBooking.total_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Booked On</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedBooking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Booking ID</p>
                    <p className="font-mono text-sm text-slate-600">#{selectedBooking.id}</p>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Special Requests</p>
                    <p className="text-sm text-slate-700">{selectedBooking.special_requests}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <SecondaryButton 
                    onClick={() => setShowModal(false)} 
                    className="flex-1"
                  >
                    Close
                  </SecondaryButton>
                  
                  {canPay(selectedBooking.status) && (
                    <PrimaryButton 
                      onClick={() => {
                        setShowModal(false);
                        handlePayNow(selectedBooking);
                      }} 
                      className="flex-1"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {showPaymentModal && selectedBookingForPayment && (
        <PaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default MyBookings;