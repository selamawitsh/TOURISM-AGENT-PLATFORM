import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FavoriteButton from '../components/FavoriteButton';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Compass,
  Mountain,
  Coffee,
  Grid3x3,
  LayoutList,
  TrendingUp,
  Clock,
  ZoomIn,
  Play,
  Pause,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { destinationAPI } from '../services/api';
import { heroSlides } from '../lib/ethiopiaVisuals';

const PAGE_SIZE = 9;

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getDifficultyBadge = (difficulty) => {
  const badges = {
    easy: { label: 'Easy', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    moderate: { label: 'Moderate', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    hard: { label: 'Challenging', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  return badges[difficulty?.toLowerCase()] || badges.easy;
};

// Enhanced Hero Section with Auto-play and Hover Pause
const HeroSection = ({ currentSlide, setCurrentSlide }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 6000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, setCurrentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (isPlaying) {
        intervalRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
      }
    }
  };

  return (
    <section className="relative h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end pb-20">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium text-white/95 mb-5">
              {heroSlides[currentSlide].label}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-5">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-white/85 text-lg mb-6 leading-relaxed max-w-2xl">
              {heroSlides[currentSlide].description}
            </p>
            <div className="flex flex-wrap gap-2">
              {heroSlides[currentSlide].chips.slice(0, 4).map((chip) => (
                <span key={chip} className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/85">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-8 right-8 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition z-10"
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition" />
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition" />
      </button>
    </section>
  );
};

// Search and Filter Bar Component
const SearchFilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onReset
}) => (
  <div className="sticky top-4 z-30">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="bg-white/75 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 bg-white/90 shadow-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white h-12 min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm text-gray-700 rounded-xl bg-gray-50 hover:bg-gray-100 transition h-12"
            >
              Reset
            </button>
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')}>
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Destination Card with Image Zoom on Hover
const DestinationCard = ({ destination, index }) => {
  const price = destination.discount_price || destination.price_per_person;
  const difficultyBadge = getDifficultyBadge(destination.difficulty);
  const isNew = new Date(destination.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group transform transition-all duration-300"
    >
      <Link to={`/destinations/${destination.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          {/* Image Container with Zoom Effect */}
          <div className="relative h-64 overflow-hidden bg-gray-100">
            <motion.img
              src={destination.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=800'}
              alt={destination.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

            <div className="absolute top-3 right-3">
              <FavoriteButton destinationId={destination.id} size="small" />
            </div>

            {destination.is_featured && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium rounded-full shadow-lg"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Featured
              </motion.span>
            )}

            {isNew && !destination.is_featured && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-medium rounded-full shadow-lg">
                New
              </span>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm", difficultyBadge.class)}>
                {difficultyBadge.label}
              </span>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-3 py-1 shadow-md flex items-baseline gap-2">
                <span className="text-base font-bold">${price}</span>
                <span className="text-[10px] opacity-80">/person</span>
              </div>
            </div>

            {/* Quick View Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition">
                <ZoomIn className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Quick View</span>
                <Button asChild size="sm" variant="default">
                  <Link to={`/destinations/${destination.slug}`}>View</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition line-clamp-1 text-lg">
                {destination.name}
              </h3>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-gray-700">{destination.rating || 'New'}</span>
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{destination.city}, {destination.country}</span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {destination.short_description || destination.description?.substring(0, 100) || 'Experience the beauty of Ethiopia'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{destination.duration} days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>max {destination.max_people || 20}</span>
                </div>
              </div>
              <div className="text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition inline-flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center gap-3 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition flex items-center justify-center ${
              currentPage === page
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Mountain className="w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-6 text-gray-500 font-medium">Discovering Ethiopia...</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-24">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Compass className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-medium text-gray-700">No destinations found</h3>
    <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
  </div>
);

// Footer Component
const InspirationalFooter = () => (
  <div className="border-t border-gray-100 mt-12 py-10">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-3 text-sm text-gray-400 mb-3">
        <Coffee className="w-4 h-4" />
        <span className="text-gray-500">Land of 13 months of sunshine</span>
        <Mountain className="w-4 h-4" />
      </div>
      <p className="text-gray-400 text-sm">
        From the Simien Mountains to the rock-hewn churches of Lalibela — Ethiopia awaits
      </p>
    </div>
  </div>
);

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await destinationAPI.getAllCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      try {
        const response = await destinationAPI.getAllDestinations(1, 100);
        setDestinations(response.data.data || []);
      } catch (err) {
        setError('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };
    loadDestinations();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const searchMatch = !searchTerm ||
        destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = !selectedCategory || destination.category?.id === selectedCategory;
      return searchMatch && categoryMatch;
    });
  }, [destinations, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredDestinations.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedDestinations = filteredDestinations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white">
      <HeroSection currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {filteredDestinations.length} destinations
            </h2>
            <p className="text-gray-500 mt-1">Discover the wonders of Ethiopia</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {filteredDestinations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedDestinations.map((destination, idx) => (
              <DestinationCard key={destination.id} destination={destination} index={idx} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <InspirationalFooter />
    </div>
  );
};

export default Destinations;