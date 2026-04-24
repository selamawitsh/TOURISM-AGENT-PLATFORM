import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI, bookingAPI, aiAPI } from '../services/api';
import { PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import {
  Calendar,
  Users,
  Phone,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Clock,
  Award,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Star,
  Coffee,
  Mountain,
  Camera,
  TrendingUp,
  Gift,
  Zap,
  Wallet,
  DollarSign
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

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } }
};

// ==================== AI BOOKING ASSISTANT COMPONENT ====================
const BookingAIAssistant = ({ destination, budget, travelDate, groupSize }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  
  useEffect(() => {
    if (destination?.id && budget > 0) {
      fetchRecommendations();
      fetchPricing();
    }
  }, [destination?.id, budget, travelDate, groupSize]);
  
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.smartBookingRecommendation({
        destination_id: destination.id,
        destination_name: destination.name,
        budget: budget,
        travel_date: travelDate,
        group_size: groupSize
      });
      console.log('AI Booking Recommendations:', response.data);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPricing = async () => {
    setPricingLoading(true);
    try {
      const season = getCurrentSeason();
      const response = await aiAPI.dynamicPricing({
        destination_id: destination.id,
        destination_name: destination.name,
        season: season,
        base_price: destination.discount_price || destination.price_per_person || 299
      });
      console.log('AI Dynamic Pricing:', response.data);
      setPricing(response.data);
    } catch (error) {
      console.error('Failed to get dynamic pricing:', error);
    } finally {
      setPricingLoading(false);
    }
  };
  
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 9 && month <= 11) return 'peak';
    if (month >= 3 && month <= 5) return 'off';
    return 'shoulder';
  };
  
  if (loading || pricingLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">AI Booking Assistant</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600"
            />
          </div>
          <span className="ml-3 text-sm text-slate-500">Analyzing best options...</span>
        </div>
      </div>
    );
  }
  
  if (!recommendations && !pricing) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main AI Assistant Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">AI Booking Assistant</h3>
            <p className="text-xs text-slate-500">Personalized recommendations for you</p>
          </div>
        </div>
        
        {/* Recommended Booking Message */}
        {recommendations?.recommended_booking && (
          <div className="bg-white/60 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {recommendations.recommended_booking.message}
                </p>
                {recommendations.recommended_booking.duration && (
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended duration: {recommendations.recommended_booking.duration}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Best Deals */}
        {recommendations?.best_deals && recommendations.best_deals.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Best Deals for You
            </h4>
            <div className="space-y-2">
              {recommendations.best_deals.map((deal, idx) => (
                <div key={idx} className="bg-white/60 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-sm text-slate-600">{deal.description}</span>
                  {deal.savings && (
                    <span className="text-xs font-bold text-emerald-600 ml-auto">
                      Save ${deal.savings}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Dynamic Pricing Info */}
        {pricing && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Price Insights
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Peak Season</p>
                <p className="font-bold text-slate-900">${pricing.peak_season}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Off Season</p>
                <p className="font-bold text-slate-900">${pricing.off_season}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">Early Bird</p>
                <p className="font-bold text-slate-900">${pricing.early_bird}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">Demand Level:</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                pricing.demand_level === 'High' ? "bg-amber-100 text-amber-700" :
                pricing.demand_level === 'Low' ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              )}>
                {pricing.demand_level}
              </span>
            </div>
          </div>
        )}
        
        {/* Travel Tips */}
        {recommendations?.tips && recommendations.tips.length > 0 && (
          <div className="border-t border-blue-100 pt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pro Tips
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendations.tips.slice(0, 3).map((tip, idx) => (
                <span key={idx} className="text-xs bg-white/60 rounded-full px-3 py-1 text-slate-600">
                  💡 {tip}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Alternative Dates */}
        {recommendations?.alternative_dates && recommendations.alternative_dates.length > 0 && (
          <div className="mt-3 text-xs text-slate-500">
            <p className="font-medium mb-1">Alternative dates for better prices:</p>
            <ul className="space-y-0.5">
              {recommendations.alternative_dates.slice(0, 2).map((date, idx) => (
                <li key={idx}>• {date}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Upgrade Suggestions */}
      {recommendations?.upgrade_suggestions && recommendations.upgrade_suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-slate-700">Upgrade Suggestions</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.upgrade_suggestions.map((upgrade, idx) => (
              <span key={idx} className="text-xs bg-white rounded-full px-3 py-1 text-slate-600">
                ✨ {upgrade}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Group Discount */}
      {pricing?.group_discount && groupSize >= (pricing.group_discount.min_people || 4) && (
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Group Discount! Save {pricing.group_discount.discount_percent}% for {pricing.group_discount.min_people}+ people
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ==================== MAIN BOOKING COMPONENT ====================
const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    travel_date: '',
    number_of_guests: 1,
    special_requests: '',
    contact_phone: user?.phone || '',
  });

  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDestination();
  }, [id, isAuthenticated]);

  const loadDestination = async () => {
    try {
      const response = await destinationAPI.getDestinationById(id);
      setDestination(response.data);
    } catch (err) {
      console.error('Error loading destination:', err);
      setError('Destination not found. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const calculateTotal = () => {
    if (!destination) return 0;
    const price = destination.discount_price || destination.price_per_person || 0;
    return price * formData.number_of_guests;
  };

  const validateStep = (step) => {
    if (step === 1) {
      return formData.travel_date && formData.number_of_guests > 0;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.travel_date) {
      setError('Please select a travel date');
      setSubmitting(false);
      return;
    }

    const travelDate = new Date(formData.travel_date);
    if (isNaN(travelDate.getTime())) {
      setError('Invalid travel date');
      setSubmitting(false);
      return;
    }

    const bookingData = {
      destination_id: id,
      travel_date: travelDate.toISOString(),
      number_of_guests: parseInt(formData.number_of_guests, 10),
      special_requests: formData.special_requests || '',
      contact_phone: formData.contact_phone || user?.phone || '',
    };

    try {
      const response = await bookingAPI.createBooking(bookingData);
      setSuccess(`Booking confirmed! Redirecting to your bookings...`);
      
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create booking';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch ((difficulty || '').toLowerCase()) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
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
            <Mountain className="absolute inset-0 m-auto h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
            Preparing your journey
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !destination) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Destination Not Found</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <PrimaryButton asChild to="/destinations" className="w-full">
              Browse Destinations
              <ChevronRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  const activePrice = destination?.discount_price || destination?.price_per_person || 0;
  const originalPrice = destination?.discount_price ? destination.price_per_person : null;
  const currentBudget = activePrice * (formData.number_of_guests || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm font-medium">Back to Destination</span>
        </motion.button>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    currentStep >= step 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm font-medium hidden sm:block",
                    currentStep >= step ? "text-emerald-700" : "text-slate-400"
                  )}>
                    {step === 1 ? 'Details' : step === 2 ? 'Contact' : 'Confirm'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-12 sm:w-20 h-0.5 mx-2",
                    currentStep > step ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Destination Summary Card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-24 border border-slate-100">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={destination?.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600'}
                  alt={destination?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {destination?.is_featured && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-white font-medium">{destination?.rating || '4.8'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{destination?.name}</h2>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{destination?.city}, {destination?.country}</span>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {destination?.short_description}
                </p>
                
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="font-semibold text-slate-900">{destination?.duration || 5} days</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Difficulty
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      getDifficultyColor(destination?.difficulty)
                    )}>
                      {destination?.difficulty || 'Easy'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Group Size
                    </span>
                    <span className="font-semibold text-slate-900">
                      Up to {destination?.max_people || 20} people
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 mt-4 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-600 text-sm">Price per person</span>
                    <div className="text-right">
                      {originalPrice && (
                        <span className="text-sm text-slate-400 line-through mr-2">
                          ${originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-emerald-600">${activePrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-slate-100">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                Complete Your Booking
              </h1>
              <p className="text-slate-600 mb-6">
                Fill in the details below to secure your Ethiopian adventure
              </p>

              {/* AI Booking Assistant - Integrated Here */}
              {destination && (
                <BookingAIAssistant
                  destination={destination}
                  budget={currentBudget}
                  travelDate={formData.travel_date}
                  groupSize={formData.number_of_guests}
                />
              )}

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Step 1: Travel Details */}
                <div className={cn(
                  "space-y-6 transition-all",
                  currentStep !== 1 && "opacity-50 pointer-events-none"
                )}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Travel Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="travel_date"
                          value={formData.travel_date}
                          onChange={handleChange}
                          onBlur={() => handleBlur('travel_date')}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className={cn(
                            "w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition",
                            touched.travel_date && !formData.travel_date
                              ? "border-rose-300 bg-rose-50/30"
                              : "border-slate-200 bg-slate-50/50 focus:bg-white"
                          )}
                        />
                      </div>
                      {touched.travel_date && !formData.travel_date && (
                        <p className="text-rose-500 text-xs mt-1">Please select a travel date</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Number of Guests <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          name="number_of_guests"
                          value={formData.number_of_guests}
                          onChange={handleChange}
                          required
                          min="1"
                          max={destination?.max_people || 20}
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Maximum {destination?.max_people || 20} guests
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Contact Information */}
                <div className={cn(
                  "space-y-6 transition-all",
                  currentStep !== 2 && "opacity-50 pointer-events-none"
                )}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder={user?.phone || 'Your phone number'}
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Special Requests
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Any dietary requirements, accessibility needs, or special occasions?"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Price Summary & Confirmation */}
                <div className={cn(
                  "space-y-6 transition-all",
                  currentStep !== 3 && "opacity-50 pointer-events-none"
                )}>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      Price Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          ${activePrice} × {formData.number_of_guests} {formData.number_of_guests === 1 ? 'person' : 'people'}
                        </span>
                        <span className="font-medium text-slate-900">
                          ${activePrice * formData.number_of_guests}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Service fee</span>
                        <span className="font-medium text-emerald-600">Included</span>
                      </div>
                      
                      <div className="border-t border-emerald-200 pt-3 mt-3">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-slate-900">Total</span>
                          <span className="text-3xl font-bold text-emerald-600">${calculateTotal()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="w-4 h-4" />
                      <span>Secure booking • Free cancellation within 48 hours</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <SecondaryButton
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-3"
                    >
                      Back
                    </SecondaryButton>
                  )}
                  
                  {currentStep < 3 ? (
                    <PrimaryButton
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!validateStep(currentStep)}
                      className="flex-1 px-6 py-3"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3"
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </PrimaryButton>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Booking;