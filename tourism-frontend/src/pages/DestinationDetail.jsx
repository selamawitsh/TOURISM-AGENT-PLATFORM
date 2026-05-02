import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { destinationService } from '../services/destinationService';
import { aiAPI } from '../services/api'; // Make sure this import is correct
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

// Animation Variants
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

// ==================== AI ENHANCEMENT COMPONENT (SIMPLIFIED) ====================
const DestinationEnhancement = ({ destination }) => {
  const [enhanced, setEnhanced] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!destination?.id || hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    aiAPI
      .enhanceDestination({
        destination_id: destination.id,
        destination_name: destination.name,
        city: destination.city,
        country: destination.country,
        description: destination.description,
      })
      .then((res) => setEnhanced(res?.data || null))
      .catch((err) => console.error('AI enhancement failed:', err))
      .finally(() => setLoading(false));
  }, [destination?.id, destination?.name, destination?.city, destination?.country, destination?.description]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 640) setOpen(true);
  }, []);

  if (loading) return <div className="p-4 text-center text-sm text-[#6a5f52]">Discovering local insights...</div>;
  if (!enhanced) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between lg:hidden mb-3">
        <h3 className="text-sm font-semibold text-[#173124]">More about this place</h3>
        <button onClick={() => setOpen(!open)} className="text-sm text-[#1f5c46]">{open ? 'Hide' : 'Show'}</button>
      </div>

      {!open ? (
        <div className="text-sm text-[#6a5f52]">{enhanced.history?.slice(0, 120)}{enhanced.history && enhanced.history.length > 120 ? '...' : ''}</div>
      ) : (
        <div className="space-y-6 mt-6">
          {enhanced.history && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/50">
              <h4 className="font-bold text-[#173124] mb-2">History & Culture</h4>
              <p className="text-sm text-[#6a5f52] leading-relaxed">{enhanced.history}</p>
            </div>
          )}

          {enhanced.hotels && enhanced.hotels.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/50">
              <h4 className="font-bold text-[#173124] mb-3">Recommended Accommodations</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {enhanced.hotels.slice(0, 3).map((h, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-100">
                    <div className="font-semibold text-[#173124]">{h.name}</div>
                    <div className="text-xs text-[#6a5f52]">{h.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {enhanced.weather && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2">Weather & Best Time</h4>
              <div className="text-sm text-[#6a5f52]">Best: {enhanced.weather.best_time || 'October to March'}</div>
            </div>
          )}

          {enhanced.activities && enhanced.activities.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2">Top Activities</h4>
              <ul className="text-sm text-[#6a5f52] space-y-2">
                {enhanced.activities.slice(0, 4).map((a, i) => (
                  <li key={i} className="flex justify-between"><span>{a.name}</span><span className="text-xs text-[#1f5c46]">${a.price || 25}</span></li>
                ))}
              </ul>
            </div>
          )}

          {enhanced.restaurants && enhanced.restaurants.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2">Where to Eat</h4>
              <ul className="text-sm text-[#6a5f52] space-y-2">
                {enhanced.restaurants.slice(0, 4).map((r, i) => (
                  <li key={i}>{r.name} — <span className="text-xs">{r.cuisine}</span></li>
                ))}
              </ul>
            </div>
          )}

          {enhanced.tips && enhanced.tips.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2">Travel Tips</h4>
              <ul className="text-sm text-[#6a5f52] list-disc pl-4">
                {enhanced.tips.slice(0, 6).map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN DESTINATION DETAIL COMPONENT (FIXED) ====================
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
  
  const hasFetched = useRef(false);

  useReveal();

  // FIX: Only fetch destination once when slug changes
  useEffect(() => {
    // Reset fetch flag when slug changes
    hasFetched.current = false;
    
    const loadDestination = async () => {
      if (!slug || hasFetched.current) return;
      
      hasFetched.current = true;
      setLoading(true);
      setError('');
      
      try {
        const res = await destinationService.getBySlug(slug);
        if (res?.data) {
          setDestination(res.data);
        } else {
          setError('Destination not found');
        }
      } catch (err) {
        console.error('Error loading destination:', err);
        setError(err.response?.status === 404 ? 'Destination not found' : 'Failed to load destination');
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [slug]); // Only re-run if slug changes

  const handleBookNow = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (destination?.id) {
      navigate(`/book/${destination.id}`);
    }
  }, [isAuthenticated, navigate, destination?.id]);

  // Memoize computed values to prevent re-calculations
  const mainImage = destination?.main_image || destinationPlaceholder;
  const shortDescription = destination?.short_description || destination?.description || 'A guided Ethiopian journey designed for travelers who want more context, comfort, and memorable views.';
  const difficultyLabel = getDifficultyLabel(destination?.difficulty);
  const activePrice = destination?.discount_price > 0 ? Number(destination.discount_price) : Number(destination?.price_per_person) || 0;
  const maxGuests = Math.max(Number(destination?.max_people) || 1, 1);
  const safeGuests = Math.min(Math.max(guests, 1), maxGuests);
  const estimatedTotal = activePrice * safeGuests;
  const ratingValue = Number(destination?.rating) > 0 ? Number(destination.rating).toFixed(1) : '4.9';
  const reviewCount = Number(destination?.review_count) || 0;
  const galleryImages = (destination?.images || []).map((image) => ({ id: image.id, url: image.image_url, caption: image.caption })).filter((image) => image.url);
  const allImages = [mainImage, ...galleryImages.map(img => img.url)].filter(Boolean);

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
              {error || 'This journey may have been moved or the path is no longer available.'}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      
      {/* HERO SECTION */}
      <section className="relative h-[55vh] lg:h-[85vh] w-full overflow-hidden">
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
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f4] via-transparent to-transparent" />

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

        {allImages.length > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          >
            {allImages.slice(0, 6).map((_, idx) => (
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeUp}
            className="lg:col-span-8 space-y-6"
          >
            {/* Title Card */}
            <motion.div 
              variants={fadeUp}
              className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-zinc-200/20 border border-white/40"
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

            {/* AI ENHANCEMENT SECTION */}
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