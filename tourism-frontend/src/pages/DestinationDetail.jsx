import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI } from '../services/api';

const destinationPlaceholder = 'https://via.placeholder.com/1600x900?text=Destination+Image';

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

const DestinationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);

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

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleBookNow = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <Card className="mx-auto max-w-3xl overflow-hidden bg-white/90">
        <CardHeader className="text-center">
          <Badge variant="outline" className="mx-auto">
            Destination lookup
          </Badge>
          <CardTitle className="text-4xl">Destination not found</CardTitle>
          <CardDescription>
            The tour you are looking for may have been removed or the link is no longer valid.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link to="/destinations">Browse destinations</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const mainImage = destination.main_image || destinationPlaceholder;
  const shortDescription =
    destination.short_description ||
    destination.description ||
    'A guided Ethiopian journey designed for travelers who want more context, comfort, and memorable views.';
  const difficultyLabel = getDifficultyLabel(destination.difficulty);
  const activePrice =
    destination.discount_price > 0 ? Number(destination.discount_price) : Number(destination.price_per_person);
  const maxGuests = Math.max(Number(destination.max_people) || 1, 1);
  const safeGuests = Math.min(Math.max(guests, 1), maxGuests);
  const estimatedTotal = activePrice * safeGuests;
  const ratingValue = Number(destination.rating) > 0 ? Number(destination.rating).toFixed(1) : 'New';
  const reviewCount = Number(destination.review_count) || 0;
  const galleryImages = (destination.images || [])
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      caption: image.caption,
    }))
    .filter((image) => image.url);

  return (
    <div className="space-y-8">
      {/* Hero Section with Animation */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[2.6rem] border border-white/55 shadow-[0_38px_110px_-52px_rgba(16,32,24,0.92)]"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          src={mainImage}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(14,24,20,0.9),rgba(22,45,36,0.7)_45%,rgba(31,92,70,0.26)_72%,rgba(166,75,34,0.22))]" />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16 hover:text-white backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to destinations
            </Link>
          </motion.div>

          <div className="mt-6 max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {destination.is_featured && (
                <Badge className="border-amber-300/30 bg-amber-500/20 text-amber-100 backdrop-blur-sm">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Featured route
                </Badge>
              )}
              {destination.category?.name && (
                <Badge variant="outline" className="border-white/15 bg-white/10 text-white backdrop-blur-sm">
                  {destination.category.icon} {destination.category.name}
                </Badge>
              )}
              <div
                className={cn(
                  'inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm',
                  getDifficultyColor(destination.difficulty),
                )}
              >
                {difficultyLabel}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <h1 className="max-w-3xl text-5xl leading-tight tracking-tight text-white sm:text-6xl">
                {destination.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/90">{shortDescription}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center gap-4 text-sm text-white/82"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                {[destination.city, destination.country].filter(Boolean).join(', ')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Star className="h-4 w-4 text-amber-300" />
                {ratingValue} rating
                <span className="text-white/62">({reviewCount} reviews)</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="grid gap-4 pt-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                { label: 'Duration', value: `${destination.duration || 0} days`, icon: CalendarDays },
                { label: 'Group size', value: `Up to ${maxGuests} guests`, icon: Users },
                { label: 'Difficulty', value: difficultyLabel, icon: Sparkles },
                { label: 'Price', value: `${formatCurrency(activePrice)} / person`, icon: ShieldCheck },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl border border-white/12 bg-white/[0.1] px-5 py-5 backdrop-blur-sm"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm uppercase tracking-wide text-white/58">{item.label}</p>
                    <p className="mt-2 text-xl text-white font-semibold">{item.value}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <Card className="bg-white/92">
            <CardHeader>
              <Badge variant="accent" className="w-fit">
                Tour overview
              </Badge>
              <CardTitle>What this destination feels like</CardTitle>
              <CardDescription>
                A fuller snapshot of the route, pace, and experience travelers can expect.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-7 text-slate-600">
                {destination.description || shortDescription}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: 'Best for',
                    value: `${difficultyLabel} travelers who want ${destination.duration || 0} well-paced days on the road.`,
                  },
                  {
                    title: 'Location',
                    value: [destination.city, destination.country].filter(Boolean).join(', ') || 'Ethiopia',
                  },
                  {
                    title: 'Group size',
                    value: `This itinerary is set up for a maximum of ${maxGuests} guests.`,
                  },
                  {
                    title: 'Category',
                    value: destination.category?.name || 'Curated tour experience',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,236,217,0.88))] p-5 soft-outline"
                  >
                    <p className="section-kicker text-secondary">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(destination.included?.length > 0 || destination.excluded?.length > 0) && (
            <div className="grid gap-6 xl:grid-cols-2">
              {destination.included?.length > 0 && (
                <Card className="bg-white/92">
                  <CardHeader>
                    <Badge variant="success" className="w-fit">
                      Included
                    </Badge>
                    <CardTitle>What comes with the tour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {destination.included.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800"
                      >
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {destination.excluded?.length > 0 && (
                <Card className="bg-white/92">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit border-rose-200 bg-rose-50 text-rose-700">
                      Excluded
                    </Badge>
                    <CardTitle>What to plan separately</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {destination.excluded.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-[1.4rem] border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-800"
                      >
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {galleryImages.length > 0 && (
            <Card className="bg-white/92">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  Gallery
                </Badge>
                <CardTitle>More views from the route</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {galleryImages.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-muted/30">
                    <img src={image.url} alt={image.caption || destination.name} className="h-52 w-full object-cover" />
                    {image.caption && (
                      <p className="px-4 py-3 text-sm text-slate-600">{image.caption}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <Card className="sticky top-28 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,236,217,0.92))]">
            <CardHeader>
              <Badge variant="gold" className="w-fit">
                Booking snapshot
              </Badge>
              <CardTitle>Start planning this trip</CardTitle>
              <CardDescription>
                Booking checkout is still being connected, so the next step currently continues through your account dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.8rem] border border-primary/10 bg-white px-5 py-5 soft-outline">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Starting from</p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="font-heading text-4xl text-slate-950">{formatCurrency(activePrice)}</span>
                      {destination.discount_price > 0 && (
                        <span className="pb-1 text-sm text-slate-400 line-through">
                          {formatCurrency(destination.price_per_person)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Per traveler</p>
                  </div>

                  {destination.discount_price > 0 && (
                    <Badge variant="success" className="border-transparent">
                      Sale price
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Preferred departure date</span>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Guests</span>
                  <Input
                    type="number"
                    min={1}
                    max={maxGuests}
                    value={safeGuests}
                    onChange={(event) => {
                      const nextGuests = Number.parseInt(event.target.value, 10);

                      setGuests(
                        Number.isNaN(nextGuests)
                          ? 1
                          : Math.min(maxGuests, Math.max(1, nextGuests)),
                      );
                    }}
                  />
                </label>
              </div>

              <div className="rounded-[1.6rem] border border-border/70 bg-white/80 px-4 py-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Estimated total</span>
                  <span className="font-semibold text-slate-950">{formatCurrency(estimatedTotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Guests</span>
                  <span>{safeGuests}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Preferred date</span>
                  <span>{selectedDate || 'Choose any time'}</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={handleBookNow} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                  {isAuthenticated ? 'Continue to Dashboard' : 'Sign In to Book'}
                </Button>
              </motion.div>

              <Button asChild variant="outline" className="w-full bg-white/70">
                <Link to="/destinations">Browse more destinations</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/92">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Why travelers like this route
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'A cleaner overview of the itinerary, difficulty, and group size before booking.',
                'Pricing is shown clearly with discount context when a special rate is active.',
                'The next step now routes through real pages in the app instead of a broken booking link.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-border/70 bg-muted/45 px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DestinationDetail;
