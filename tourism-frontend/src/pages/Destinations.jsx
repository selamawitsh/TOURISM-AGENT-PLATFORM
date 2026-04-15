import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FavoriteButton from '../components/FavoriteButton';
import {
  ArrowRight,
  CalendarDays,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { destinationAPI } from '../services/api';
import { heroSlides } from '../lib/ethiopiaVisuals';

const PAGE_SIZE = 9;
const destinationPlaceholder = 'https://via.placeholder.com/1200x900?text=Destination+Image';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getDifficultyColor = (difficulty) => {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'moderate':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'hard':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
};

const getDifficultyLabel = (difficulty) => {
  const normalized = (difficulty || 'easy').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await destinationAPI.getAllCategories();
        if (isMounted) {
          setCategories(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDestinations = async () => {
      setLoading(true);
      setError('');

      try {
        const aggregatedDestinations = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await destinationAPI.getAllDestinations(currentPage, 100);
          const payload = response.data;

          aggregatedDestinations.push(...(payload.data || []));
          totalPages = payload.total_pages || 1;
          currentPage += 1;
        } while (currentPage <= totalPages);

        if (isMounted) {
          setDestinations(aggregatedDestinations);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load destinations');
        }
        console.error('Error fetching destinations:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const searchableFields = [
        destination.name,
        destination.city,
        destination.country,
        destination.short_description,
        destination.description,
        destination.category?.name,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      const matchesSearch =
        !normalizedSearch || searchableFields.some((value) => value.includes(normalizedSearch));
      const matchesCategory =
        !selectedCategory || String(destination.category?.id || '') === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [destinations, normalizedSearch, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedDestinations = useMemo(() => {
    return filteredDestinations.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE,
    );
  }, [filteredDestinations, safePage]);
  const featuredCount = useMemo(() => {
    return destinations.filter((destination) => destination.is_featured).length;
  }, [destinations]);

  if (loading && destinations.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Carousel Section */}
      <section className="relative h-[80vh] overflow-hidden rounded-[2.6rem]">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl text-white"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-4"
              >
                <Badge className="border-amber-300/30 bg-amber-500/20 text-amber-100 backdrop-blur-sm">
                  {heroSlides[currentSlide].label}
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-6 text-5xl font-bold leading-tight lg:text-6xl"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mb-8 text-lg leading-relaxed text-white/90"
              >
                {heroSlides[currentSlide].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-wrap gap-3"
              >
                {heroSlides[currentSlide].chips.map((chip, index) => (
                  <motion.span
                    key={chip}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {chip}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              )}
            />
          ))}
        </div>

        {/* Side Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {[
          { label: 'Destinations', value: destinations.length, icon: MapPin },
          { label: 'Featured routes', value: featuredCount, icon: Sparkles },
          { label: 'Categories', value: categories.length, icon: Star },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="rounded-[2rem] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-950">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Card className="bg-white/92">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[1.2fr_0.8fr_auto]">
          <label className="block space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Search className="h-4 w-4 text-secondary" />
              Search destinations
            </span>
            <Input
              type="text"
              placeholder="Search by place, route style, or destination name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4 text-secondary" />
              Category
            </span>
            <Select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/80 md:w-auto"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Reset filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50/90">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker text-secondary">Results</p>
          <h2 className="mt-2 font-heading text-3xl text-slate-950">
            {filteredDestinations.length} destination{filteredDestinations.length === 1 ? '' : 's'} found
          </h2>
        </div>

        {(searchTerm || selectedCategory) && (
          <Badge variant="outline" className="w-fit bg-white/70 text-slate-700">
            Showing filtered results
          </Badge>
        )}
      </div>

      {paginatedDestinations.length === 0 && !loading ? (
        <Card className="bg-white/92">
          <CardHeader className="text-center">
            <Badge variant="outline" className="mx-auto">
              No matches
            </Badge>
            <CardTitle>No destinations matched those filters</CardTitle>
            <CardDescription>
              Try a broader search term or clear the category filter to explore more routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="bg-white/80"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {paginatedDestinations.map((destination, index) => {
            const activePrice =
              destination.discount_price > 0
                ? Number(destination.discount_price)
                : Number(destination.price_per_person);
            const reviewLabel =
              Number(destination.rating) > 0
                ? Number(destination.rating).toFixed(1)
                : 'New';

            return (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden border-0 bg-white/95 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={destination.main_image || destinationPlaceholder}
                      alt={destination.name}
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      whileHover={{ scale: 1.05 }}
                    />

                     {/* Add FavoriteButton here */}
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton destinationId={destination.id} size="default" />
                    </div>

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                      {destination.is_featured && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Badge className="border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        </motion.div>
                      )}

                      {destination.discount_price > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Badge className="border-0 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                            Save{' '}
                            {Math.round(
                              ((Number(destination.price_per_person) - Number(destination.discount_price)) /
                                Number(destination.price_per_person)) *
                                100,
                            )}
                            %
                          </Badge>
                        </motion.div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {[destination.city, destination.country].filter(Boolean).join(', ')}
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-sm backdrop-blur-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {reviewLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.category?.name && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {destination.category.icon} {destination.category.name}
                        </Badge>
                      )}
                      <div
                        className={cn(
                          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          getDifficultyColor(destination.difficulty),
                        )}
                      >
                        {getDifficultyLabel(destination.difficulty)}
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight text-slate-950 group-hover:text-emerald-700 transition-colors">
                      {destination.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {destination.short_description ||
                        destination.description ||
                        'Experience the rich heritage and stunning landscapes of Ethiopia on this carefully crafted journey.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          <CalendarDays className="h-4 w-4 text-emerald-600" />
                          {destination.duration || 0} days
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          <Users className="h-4 w-4 text-emerald-600" />
                          Up to {destination.max_people || 1} guests
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-emerald-600">{formatCurrency(activePrice)}</span>
                          {destination.discount_price > 0 && (
                            <span className="pb-1 text-sm text-slate-400 line-through">
                              {formatCurrency(destination.price_per_person)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">Per traveler</p>
                      </div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                        >
                          <Link to={`/destinations/${destination.slug}`}>
                            Explore
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && paginatedDestinations.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Page {safePage} of {totalPages}
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-white/80"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-white/80"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
