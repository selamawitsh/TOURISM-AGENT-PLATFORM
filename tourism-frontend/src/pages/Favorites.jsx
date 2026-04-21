import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import { 
  Heart, 
  Trash2, 
  MapPin, 
  Star, 
  ArrowRight, 
  Compass,
  Sparkles,
  Calendar,
  Users,
  ChevronRight,
  Filter,
  Grid3x3,
  LayoutList,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
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
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

const Favorites = () => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await favoritesAPI.getFavorites();
      
      let favoritesData = [];
      if (response.data && Array.isArray(response.data.data)) {
        favoritesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        favoritesData = response.data;
      } else if (Array.isArray(response)) {
        favoritesData = response;
      } else if (response.data && response.data.favorites) {
        favoritesData = response.data.favorites;
      }
      
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (destinationId) => {
    setRemovingId(destinationId);
    try {
      await favoritesAPI.removeFavorite(destinationId);
      setFavorites(prev => prev.filter(fav => getDestinationProperty(fav, 'id') !== destinationId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const getDestinationProperty = (favorite, property, defaultValue = '') => {
    const propertyMap = {
      name: ['destination_name', 'name', 'title', 'destinationTitle'],
      city: ['destination_city', 'city', 'location_city'],
      country: ['destination_country', 'country', 'location_country'],
      price: ['destination_price', 'price', 'cost', 'price_per_person', 'discount_price'],
      image: ['destination_image', 'image', 'image_url', 'imageUrl', 'photo', 'picture', 'main_image'],
      id: ['destination_id', 'destinationId', 'id', 'favorite_id'],
      rating: ['destination_rating', 'rating', 'average_rating', 'avg_rating'],
      duration: ['duration', 'duration_days', 'trip_duration'],
    };
    
    const possibleNames = propertyMap[property] || [property];
    
    for (const name of possibleNames) {
      if (favorite[name] !== undefined && favorite[name] !== null) {
        return favorite[name];
      }
    }
    
    return defaultValue;
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    const nameA = getDestinationProperty(a, 'name', '');
    const nameB = getDestinationProperty(b, 'name', '');
    const priceA = getDestinationProperty(a, 'price', 0);
    const priceB = getDestinationProperty(b, 'price', 0);
    
    switch(sortBy) {
      case 'name': return nameA.localeCompare(nameB);
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      default: return 0;
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full text-center"
        >
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-12 shadow-xl border border-rose-100">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Save Your Favorites</h2>
            <p className="text-slate-600 mb-8">
              Sign in to save and organize your favorite destinations for your next Ethiopian adventure!
            </p>
            <PrimaryButton asChild to="/login" className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl">
              Sign In to Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-20 w-20 rounded-full border-4 border-rose-100 border-t-rose-500"
            />
            <Heart className="absolute inset-0 m-auto h-8 w-8 text-rose-500" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
            Loading your favorites
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-rose-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-rose-600 mb-6">{error}</p>
          <SecondaryButton onClick={loadFavorites} className="px-6 py-3">
            Try Again
          </SecondaryButton>
        </motion.div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-2xl w-full"
        >
          <div className="bg-gradient-to-br from-slate-50 to-zinc-50 rounded-3xl p-12 shadow-xl border border-slate-200 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-zinc-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">No favorites yet</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Start exploring Ethiopia's amazing destinations and save your favorites to plan your perfect journey!
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🏔️', label: 'Mountains' },
                { icon: '🏛️', label: 'History' },
                { icon: '🌋', label: 'Adventure' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                </div>
              ))}
            </div>
            
            <PrimaryButton asChild to="/destinations" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl text-lg">
              <span className="flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Explore Destinations
                <ArrowRight className="w-5 h-5" />
              </span>
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 lg:mb-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">My Favorites</h1>
            </div>
            <p className="text-slate-600 text-lg">
              You have <span className="font-semibold text-rose-600">{favorites.length}</span> saved {favorites.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Favorites Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            : "space-y-4"
        )}
      >
        <AnimatePresence mode="popLayout">
          {sortedFavorites.map((favorite) => {
            const destinationId = getDestinationProperty(favorite, 'id');
            const destinationName = getDestinationProperty(favorite, 'name', 'Destination');
            const destinationCity = getDestinationProperty(favorite, 'city', '');
            const destinationCountry = getDestinationProperty(favorite, 'country', '');
            const destinationPrice = getDestinationProperty(favorite, 'price', 0);
            const destinationImage = getDestinationProperty(favorite, 'image', 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600');
            const destinationRating = getDestinationProperty(favorite, 'rating', 4.8);
            const destinationDuration = getDestinationProperty(favorite, 'duration', '5-7');
            const slug = destinationName.toLowerCase().replace(/\s+/g, '-');
            const isRemoving = removingId === destinationId;
            
            if (viewMode === 'list') {
              return (
                <motion.div
                  key={destinationId}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className={cn(
                    "bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all",
                    isRemoving && "opacity-50"
                  )}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-64 h-48 sm:h-auto">
                      <img
                        src={destinationImage}
                        alt={destinationName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600';
                        }}
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton 
                          destinationId={destinationId} 
                          size="default" 
                          onToggle={loadFavorites}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link to={`/destinations/${slug}`}>
                            <h3 className="text-xl font-bold text-slate-900 hover:text-rose-600 transition mb-1">
                              {destinationName}
                            </h3>
                          </Link>
                          {(destinationCity || destinationCountry) && (
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {[destinationCity, destinationCountry].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium text-amber-700">{destinationRating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>{destinationDuration} days</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-rose-600">${destinationPrice}</span>
                          <span className="text-sm text-slate-400"> / person</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/destinations/${slug}`}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            View
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRemove(destinationId)}
                            disabled={isRemoving}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={destinationId}
                variants={itemVariants}
                exit="exit"
                layout
                whileHover={{ y: -4 }}
                className={cn(
                  "bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 group",
                  isRemoving && "opacity-50"
                )}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={destinationImage}
                    alt={destinationName}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton 
                      destinationId={destinationId} 
                      size="default" 
                      onToggle={loadFavorites}
                    />
                  </div>
                  
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white font-medium">{destinationRating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <Link to={`/destinations/${slug}`}>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition mb-2 line-clamp-1">
                      {destinationName}
                    </h3>
                  </Link>
                  
                  {(destinationCity || destinationCountry) && (
                    <p className="text-slate-500 text-sm mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {[destinationCity, destinationCountry].filter(Boolean).join(', ')}
                      </span>
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-rose-600">${destinationPrice}</span>
                      <span className="text-xs text-slate-400"> / person</span>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(destinationId)}
                      disabled={isRemoving}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      
      {/* Quick Actions */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/destinations"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Compass className="w-5 h-5" />
            Discover More Destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;