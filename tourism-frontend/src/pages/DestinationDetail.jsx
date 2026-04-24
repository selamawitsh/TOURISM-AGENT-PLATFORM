import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Heart,
  Share2,
  ChevronRight,
  Award,
  Camera,
  Coffee,
  Mountain,
  Hotel,
  Utensils,
  Sun,
  CloudRain,
  TrendingUp,
  Info,
  CheckCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Container, PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI, aiAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';
import { useReveal } from '@/lib/uiEffects';

const destinationPlaceholder = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1600';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getDifficultyColor = (difficulty) => {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'moderate':
      return 'bg-amber-50 text-amber-800 border-amber-100';
    case 'hard':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

const getDifficultyLabel = (difficulty) => {
  const normalized = (difficulty || 'easy').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Premium Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3 } }
};

// ==================== AI ENHANCEMENT COMPONENT ====================
const DestinationEnhancement = ({ destination }) => {
  const [enhanced, setEnhanced] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (destination?.id) {
      loadEnhancedContent();
    }
  }, [destination?.id]);
  
  const loadEnhancedContent = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.enhanceDestination({
        destination_id: destination.id,
        destination_name: destination.name,
        city: destination.city,
        country: destination.country,
        description: destination.description
      });
      console.log('AI Enhancement response:', response.data);
      setEnhanced(response.data);
    } catch (error) {
      console.error('Failed to load enhanced content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-[#e8d5b7] border-t-[#1f5c46]"
            />
          </div>
          <p className="text-sm text-[#6a5f52]">Discovering local insights...</p>
        </div>
      </motion.div>
    );
  }
  
  if (!enhanced) return null;
  
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="space-y-6 mt-8"
    >
      {/* History & Culture Section */}
      {enhanced.history && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 p-2">
              <Info className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">History & Culture</h3>
          </div>
          <p className="text-[#6a5f52] leading-relaxed">{enhanced.history}</p>
        </div>
      )}
      
      {/* Hotels Section - Check if hotels exist and have length */}
      {enhanced.hotels && Array.isArray(enhanced.hotels) && enhanced.hotels.length > 0 && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 p-2">
              <Hotel className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">Recommended Accommodations</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {enhanced.hotels.map((hotel, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="border border-zinc-100 rounded-xl p-4 hover:shadow-lg transition-all"
              >
                <h4 className="font-bold text-[#173124]">{hotel.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-sm text-[#6a5f52]">{hotel.rating || 4.5}</span>
                  <span className="text-xs text-[#6a5f52]">{hotel.price_range || '$$'}</span>
                </div>
                <p className="text-sm text-[#6a5f52] mt-2">{hotel.description || 'Comfortable stay near attractions'}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Weather & Best Time Section */}
      {enhanced.weather && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-white/50 p-2">
              <Sun className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">Weather & Best Time to Visit</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-xl p-3 text-center">
              <p className="text-xs text-[#6a5f52] mb-1">Best Time</p>
              <p className="font-bold text-[#173124]">{enhanced.weather.best_time || 'October to March'}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 text-center">
              <p className="text-xs text-[#6a5f52] mb-1">Temperature</p>
              <p className="font-bold text-[#173124]">{enhanced.weather.temperature || '15°C - 25°C'}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 text-center">
              <p className="text-xs text-[#6a5f52] mb-1">Rainy Season</p>
              <p className="font-bold text-[#173124]">{enhanced.weather.rainy_season || 'June to September'}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 text-center">
              <p className="text-xs text-[#6a5f52] mb-1">Current</p>
              <p className="font-bold text-[#173124]">{enhanced.weather.current_weather || 'Pleasant'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Activities Section - Only show if activities exist */}
      {enhanced.activities && Array.isArray(enhanced.activities) && enhanced.activities.length > 0 && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-2">
              <TrendingUp className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">Top Activities & Tours</h3>
          </div>
          <div className="space-y-3">
            {enhanced.activities.map((activity, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 to-white rounded-xl border border-zinc-100"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-[#173124]">{activity.name}</h4>
                  <p className="text-sm text-[#6a5f52]">{activity.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-[#1f5c46] font-bold text-lg">${activity.price || 25}</div>
                  <div className="text-xs text-[#6a5f52]">{activity.duration || '2-3 hours'}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Restaurant Recommendations Section */}
      {enhanced.restaurants && Array.isArray(enhanced.restaurants) && enhanced.restaurants.length > 0 && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-2">
              <Utensils className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">Where to Eat</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {enhanced.restaurants.map((restaurant, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-[#1f5c46]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#173124] text-sm">{restaurant.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6a5f52]">{restaurant.cuisine}</span>
                    <span className="text-xs text-[#6a5f52]">{restaurant.price_range}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Travel Tips Section */}
      {enhanced.tips && Array.isArray(enhanced.tips) && enhanced.tips.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-white/50 p-2">
              <CheckCircle className="h-5 w-5 text-[#1f5c46]" />
            </div>
            <h3 className="text-lg font-bold text-[#173124]">Travel Tips & Advice</h3>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {enhanced.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#6a5f52] text-sm">
                <span className="text-[#1f5c46] mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

// ==================== MAIN DESTINATION DETAIL COMPONENT ====================
const DestinationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useReveal();

  useEffect(() => {
    let isMounted = true;

    const loadDestination = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await destinationAPI.getDestinationBySlug(slug);
        if (isMounted) {
          setDestination(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Destination not found');
        }
        console.error('Error fetching destination:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDestination();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/book/${destination.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-[#f5ede1]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-20 w-20 rounded-full border-4 border-[#e8d5b7] border-t-[#1f5c46]"
            />
            <Mountain className="absolute inset-0 m-auto h-8 w-8 text-[#1f5c46]" />
          </div>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-[#7e725f]">
            Loading your journey
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-[#f5ede1] p-6">
        <motion.div initial="hidden" animate="visible" variants={scaleIn} className="w-full max-w-lg">
          <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white/80 backdrop-blur-sm shadow-2xl text-center p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 text-[#1f5c46] mb-6">
              <MapPin className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#173124] mb-3">Route Not Found</CardTitle>
            <CardDescription className="text-[#6a5f52] mb-8 text-base">
              This journey may have been moved or the path is no longer available.
            </CardDescription>
            <PrimaryButton asChild to="/destinations" className="rounded-full bg-[#1f5c46] hover:bg-[#174635] text-white px-8 py-4">
              Explore Collection
              <ChevronRight className="ml-2 h-4 w-4" />
            </PrimaryButton>
          </Card>
        </motion.div>
      </div>
    );
  }

  const mainImage = destination.main_image || destinationPlaceholder;
  const shortDescription = destination.short_description || destination.description || 'A guided Ethiopian journey designed for travelers who want more context, comfort, and memorable views.';
  const difficultyLabel = getDifficultyLabel(destination.difficulty);
  const activePrice = destination.discount_price > 0 ? Number(destination.discount_price) : Number(destination.price_per_person);
  const maxGuests = Math.max(Number(destination.max_people) || 1, 1);
  const safeGuests = Math.min(Math.max(guests, 1), maxGuests);
  const estimatedTotal = activePrice * safeGuests;
  const ratingValue = Number(destination.rating) > 0 ? Number(destination.rating).toFixed(1) : '4.9';
  const reviewCount = Number(destination.review_count) || 0;
  const galleryImages = (destination.images || []).map((image) => ({ id: image.id, url: image.image_url, caption: image.caption })).filter((image) => image.url);
  const allImages = [mainImage, ...galleryImages.map(img => img.url)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      
      {/* HERO SECTION - Full Bleed with Parallax */}
      <section className="relative h-[70vh] lg:h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImageIndex}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={allImages[activeImageIndex] || mainImage}
              alt={destination.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f4] via-transparent to-transparent" />

        {/* Top Navigation Bar */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute top-6 left-6 lg:left-12 z-20 flex items-center gap-4"
        >
          <Link 
            to="/destinations" 
            className="group flex items-center gap-3 rounded-full bg-black/30 backdrop-blur-xl px-5 py-3 text-white border border-white/20 transition-all hover:bg-black/40 hover:scale-105"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Back to Collection</span>
          </Link>
          
          <div className="flex gap-2">
            <button className="rounded-full bg-black/30 backdrop-blur-xl p-3 text-white border border-white/20 transition-all hover:bg-black/40 hover:scale-105">
              <Share2 size={18} />
            </button>
            <FavoriteButton destinationId={destination.id} className="rounded-full bg-black/30 backdrop-blur-xl p-3 text-white border border-white/20" />
          </div>
        </motion.div>

        {/* Image Gallery Dots */}
        {allImages.length > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          >
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  idx === activeImageIndex 
                    ? "w-12 bg-white" 
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN - Main Content */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeUp}
            className="lg:col-span-8 space-y-6"
          >
            {/* Title Card */}
            <motion.div 
              variants={fadeUp}
              className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-8 lg:p-10 shadow-2xl shadow-zinc-200/30 border border-white/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {destination.is_featured && (
                    <Badge className="bg-gradient-to-r from-[#f0c15c] to-amber-400 text-[#173124] border-none font-bold text-xs px-4 py-2 rounded-full">
                      <Sparkles size={12} className="mr-1"/> Featured Journey
                    </Badge>
                  )}
                  {destination.category?.name && (
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-100 font-bold text-xs px-4 py-2 rounded-full">
                      {destination.category.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-amber-50 rounded-full px-4 py-2">
                  <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                  <span className="font-bold text-amber-900">{ratingValue}</span>
                  <span className="text-amber-700/60 text-xs ml-1">({reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#173124] leading-[1.1] mb-4">
                {destination.name}
              </h1>
              
              <p className="flex items-center gap-2 text-[#6a5f52] font-medium mb-8">
                <MapPin size={18} className="text-emerald-700" /> 
                {[destination.city, destination.country].filter(Boolean).join(', ')}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Duration', value: `${destination.duration || 0} Days`, icon: Clock },
                  { label: 'Group Size', value: `Up to ${maxGuests}`, icon: Users },
                  { label: 'Difficulty', value: difficultyLabel, icon: Award },
                  { label: 'Starting at', value: formatCurrency(activePrice), icon: Sparkles },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -4 }}
                    className={cn(
                      "rounded-2xl p-4 border transition-all",
                      i === 2 ? getDifficultyColor(destination.difficulty) : "bg-gradient-to-br from-white to-zinc-50 border-zinc-100"
                    )}
                  >
                    <item.icon className="text-emerald-700 mb-2" size={20} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{item.label}</p>
                    <p className="font-bold text-[#173124]">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-[#6a5f52] leading-relaxed font-light italic border-l-4 border-[#1f5c46] pl-6 mb-6">
                  {shortDescription}
                </p>
                <div className="text-[#62584b] leading-relaxed space-y-4">
                  {destination.description?.split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI ENHANCEMENT SECTION - INTEGRATED HERE */}
            <DestinationEnhancement destination={destination} />

            {/* Highlights Section */}
            {destination.highlights && destination.highlights.length > 0 && (
              <motion.div 
                variants={fadeUp}
                className="grid sm:grid-cols-2 gap-4"
              >
                {destination.highlights?.slice(0, 4).map((highlight, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-50 p-2">
                        <Camera className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#173124] mb-1">Highlight {i + 1}</h4>
                        <p className="text-sm text-[#6a5f52]">{highlight}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Included / Excluded */}
            {(destination.included?.length > 0 || destination.excluded?.length > 0) && (
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                {destination.included?.length > 0 && (
                  <div className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-6 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" /> Included
                    </h3>
                    <ul className="space-y-2">
                      {destination.included.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-[#173124]">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {destination.excluded?.length > 0 && (
                  <div className="bg-white rounded-[2rem] p-8 border border-rose-100 shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-rose-800 mb-6 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" /> Not Included
                    </h3>
                    <ul className="space-y-2">
                      {destination.excluded.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-[#173124]">
                          <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div variants={fadeUp}>
              <ReviewSection destinationId={destination.id} destinationName={destination.name} />
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - Booking Card */}
          <motion.div 
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4"
          >
            <div className="sticky top-8 space-y-4">
              {/* Price Card */}
              <Card className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl shadow-zinc-200/40">
                <div className="bg-gradient-to-br from-[#173124] to-[#1f5c46] p-8 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-2">
                    Journey Price
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold">{formatCurrency(activePrice)}</span>
                    {destination.discount_price > 0 && (
                      <span className="text-white/50 line-through text-lg">
                        {formatCurrency(destination.price_per_person)}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-2">per person</p>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Date Selection */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6a5f52] mb-2 block">
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Guest Selection */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6a5f52] mb-2 block">
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="h-12 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-xl font-bold hover:bg-zinc-100"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={1}
                        max={maxGuests}
                        value={safeGuests}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value, 10);
                          setGuests(Number.isNaN(val) ? 1 : Math.min(maxGuests, Math.max(1, val)));
                        }}
                        className="h-12 flex-1 rounded-xl border-zinc-200 bg-zinc-50 text-center font-bold"
                      />
                      <button
                        onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                        className="h-12 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-xl font-bold hover:bg-zinc-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6a5f52]">Base price</span>
                        <span className="font-medium">{formatCurrency(activePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6a5f52]">Guests</span>
                        <span className="font-medium">× {safeGuests}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold">
                        <span className="text-[#173124]">Total</span>
                        <span className="text-xl text-[#1f5c46]">{formatCurrency(estimatedTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <PrimaryButton 
                      onClick={handleBookNow} 
                      className="w-full h-12 rounded-full bg-gradient-to-r from-[#1f5c46] to-[#174635] text-white font-bold shadow-lg shadow-emerald-900/20 hover:scale-[1.02] transition-all"
                    >
                      {isAuthenticated ? 'Reserve Now' : 'Sign in to Book'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </PrimaryButton>
                    
                    <SecondaryButton className="w-full h-12 rounded-full border-2 border-zinc-200 bg-white font-medium hover:bg-zinc-50">
                      <Heart className="mr-2 h-4 w-4" />
                      Save for Later
                    </SecondaryButton>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-4 text-xs text-[#6a5f52]">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Secure Booking</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award size={14} className="text-emerald-600" />
                      <span>Best Price</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Local Guide Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 p-3">
                    <Coffee className="h-6 w-6 text-[#1f5c46]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#173124]">Local Expert Guide</h4>
                    <p className="text-sm text-[#6a5f52]">Authentic Ethiopian experience</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;