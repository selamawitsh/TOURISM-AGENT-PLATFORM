import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid3x3,
  LayoutList,
  MapPin,
  Mountain,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import FavoriteButton from '../components/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn } from '@/lib/utils';
import { destinationAPI } from '../services/api';

const PAGE_SIZE = 9;
const destinationPlaceholder = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1200';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getDifficultyBadge = (difficulty) => {
  const badges = {
    easy: {
      label: 'Easy',
      className: 'border-emerald-200/90 bg-emerald-50/92 text-emerald-700',
    },
    moderate: {
      label: 'Moderate',
      className: 'border-amber-200/90 bg-amber-50/92 text-amber-800',
    },
    hard: {
      label: 'Challenging',
      className: 'border-rose-200/90 bg-rose-50/92 text-rose-700',
    },
  };

  return badges[(difficulty || 'easy').toLowerCase()] || badges.easy;
};

const getPageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page);
    return pages;
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const LoadingSpinner = () => (
  <div className="flex min-h-[72vh] items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#f5ebdb_100%)]">
    <div className="text-center">
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#d9c8ac]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#1f5c46] border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Mountain className="h-7 w-7 text-[#1f5c46]" />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium uppercase tracking-[0.28em] text-[#7e725f]">Curating the collection</p>
    </div>
  </div>
);

const EmptyState = ({ onReset }) => (
  <div className="rounded-[2.4rem] border border-[#d9c8ac] bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(245,236,220,0.88))] px-6 py-14 text-center shadow-[0_28px_90px_rgba(99,72,31,0.1)]">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ead8b6] text-[#6b4d1d]">
      <Compass className="h-9 w-9" />
    </div>
    <h3 className="mt-6 text-3xl text-[#173124]">No destinations match that mood yet.</h3>
    <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#61574a]">
      Try a different destination name, city, or category and the collection will open back up.
    </p>
    <Button
      type="button"
      onClick={onReset}
      className="mt-7 rounded-full bg-[#1f5c46] px-7 text-white hover:bg-[#174635]"
    >
      Reset filters
    </Button>
  </div>
);

const DestinationHero = ({
  currentSlide,
  destinationCount,
  featuredCount,
  categoryCount,
  isPlaying,
  onNext,
  onPrev,
  onTogglePlay,
  onGoToSlide,
  onScrollToResults,
}) => {
  const activeSlide = heroSlides[currentSlide];

  const heroSignals = [
    {
      value: `${destinationCount}+ routes`,
      label: 'Browse iconic landmarks, mountain escapes, and culture-rich city stays.',
    },
    {
      value: `${featuredCount} featured`,
      label: 'Spotlight itineraries that already feel like your next postcard moment.',
    },
    {
      value: `${categoryCount} categories`,
      label: 'Search by travel style instead of digging through a flat, generic list.',
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-stone-950">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.label}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img src={activeSlide.image} alt={activeSlide.title} className="h-full w-full animate-pan-slow object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(252,209,22,0.16),transparent_26%),linear-gradient(135deg,rgba(8,16,12,0.88)_8%,rgba(10,22,19,0.62)_48%,rgba(9,23,18,0.9)_100%)]" />
      <div className="absolute -left-16 top-14 h-72 w-72 rounded-full bg-[#f0c15c]/24 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative z-20 mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-end gap-10 py-10 lg:grid-cols-[minmax(0,1.14fr)_minmax(320px,430px)] lg:gap-14 lg:py-16">
          <div className="max-w-3xl">
            <Badge className="animate-fade-up rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-white backdrop-blur-md">
              <Sparkles className="mr-2 h-4 w-4" />
              Curated Ethiopian Escapes
            </Badge>

            <h1 className="animate-fade-up delay-100 mt-6 max-w-4xl text-5xl leading-[0.95] font-semibold text-white sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
              Find the destination that fits your rhythm.
            </h1>

            <p className="animate-fade-up delay-200 mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
              Move from sacred stonework and coffee-country calm to dramatic highland trails and walled-city color. The
              current spotlight is on <span className="font-semibold text-[#f2ca70]">{activeSlide.label}</span>.
            </p>

            <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-4">
              <Button
                type="button"
                size="lg"
                onClick={onScrollToResults}
                className="rounded-full bg-[#f0c15c] px-8 py-6 text-base font-semibold text-[#183221] shadow-[0_18px_50px_rgba(240,193,92,0.3)] transition hover:bg-[#f6cf7f]"
              >
                Explore the Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-white/8 px-8 py-6 text-base text-white backdrop-blur-md transition hover:bg-white/14 hover:text-white"
              >
                <Link to="/register">Start Planning</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroSignals.map((signal) => (
                <div
                  key={signal.value}
                  className="rounded-[1.6rem] border border-white/14 bg-white/8 p-4 backdrop-blur-md shadow-[0_14px_45px_rgba(0,0,0,0.18)]"
                >
                  <p className="text-sm font-semibold tracking-wide text-[#f2ca70]">{signal.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-white/14 bg-white/10 text-white shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between gap-4">
                <Badge className="rounded-full border border-white/14 bg-white/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-white">
                  <Compass className="mr-2 h-3.5 w-3.5" />
                  Featured Scene
                </Badge>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white transition hover:bg-black/35"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-white/55">{activeSlide.label}</p>
                <CardTitle className="mt-3 text-3xl leading-tight text-white md:text-4xl">{activeSlide.title}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-sm leading-7 text-white/78 md:text-base">{activeSlide.description}</p>

              <div className="flex flex-wrap gap-2">
                {activeSlide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-white/90"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="rounded-[1.8rem] border border-white/14 bg-black/18 p-4">
                <div className="mb-4 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.28em] text-white/55">
                  <span>Scene {String(currentSlide + 1).padStart(2, '0')}</span>
                  <span>{heroSlides.length} regions</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onPrev}
                    aria-label="Previous slide"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 transition hover:bg-white/14"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex flex-1 gap-2">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.label}
                        type="button"
                        aria-label={`Go to ${slide.label}`}
                        onClick={() => onGoToSlide(index)}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          index === currentSlide ? 'flex-1 bg-[#f0c15c]' : 'w-6 bg-white/30 hover:bg-white/55'
                        )}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={onNext}
                    aria-label="Next slide"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 transition hover:bg-white/14"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const SearchFilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredCount,
  totalCount,
  viewMode,
  setViewMode,
  onReset,
}) => (
  <div className="sticky top-4 z-30">
    <div className="rounded-[2rem] border border-[#d9c8ac] bg-[linear-gradient(180deg,rgba(255,250,243,0.92),rgba(247,236,217,0.88))] p-4 shadow-[0_20px_70px_rgba(102,73,28,0.12)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f5c46]/10 text-[#1f5c46]">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f5b28]">Refine The Collection</p>
            <p className="mt-1 text-sm leading-7 text-[#62584b]">
              Showing {filteredCount} of {totalCount} destinations with search and category filters.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-full bg-[#f5ead8] p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
              viewMode === 'grid' ? 'bg-white text-[#173124] shadow-sm' : 'text-[#776b5c] hover:text-[#173124]'
            )}
          >
            <Grid3x3 className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
              viewMode === 'list' ? 'bg-white text-[#173124] shadow-sm' : 'text-[#776b5c] hover:text-[#173124]'
            )}
          >
            <LayoutList className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8e7f67]" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search destinations, cities, or regions..."
            className="h-[52px] rounded-[1.2rem] border-[#d9c8ac] bg-white/90 pl-12 text-sm shadow-sm focus:border-[#1f5c46] focus:ring-[#1f5c46]/15"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="h-[52px] rounded-[1.2rem] border border-[#d9c8ac] bg-white/90 px-4 text-sm text-[#173124] shadow-sm outline-none transition focus:border-[#1f5c46]"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onReset}
            variant="outline"
            className="h-[52px] flex-1 rounded-[1.2rem] border-[#d9c8ac] bg-white/70 text-[#61574a] hover:bg-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const DestinationCard = ({ destination, index, viewMode }) => {
  const price = Number(destination.discount_price) > 0 ? Number(destination.discount_price) : Number(destination.price_per_person);
  const ratingValue = Number(destination.rating) > 0 ? Number(destination.rating).toFixed(1) : 'New';
  const difficultyBadge = getDifficultyBadge(destination.difficulty);
  const isNew = destination.created_at
    ? new Date(destination.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;
  const location = [destination.city, destination.country].filter(Boolean).join(', ') || 'Ethiopia';
  const summary =
    destination.short_description ||
    destination.description ||
    'A layered Ethiopian route with memorable landscapes, local atmosphere, and a calmer travel rhythm.';
  const image = destination.main_image || destinationPlaceholder;
  const categoryLabel = destination.category?.name || 'Curated route';

  if (viewMode === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.04 }}
        className="overflow-hidden rounded-[2.2rem] border border-[#d9c8ac] bg-white/82 shadow-[0_26px_80px_rgba(99,72,31,0.12)] backdrop-blur-sm"
      >
        <div className="grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="relative min-h-[260px] overflow-hidden">
            <Link to={`/destinations/${destination.slug}`} className="block h-full">
              <img
                src={image}
                alt={destination.name}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,14,0.08)_0%,rgba(11,17,14,0.55)_100%)]" />
            </Link>

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {destination.is_featured ? (
                <Badge className="border-0 bg-[#f0c15c] text-[#173124]">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Featured
                </Badge>
              ) : null}
              {!destination.is_featured && isNew ? (
                <Badge className="border-0 bg-emerald-500 text-white">New</Badge>
              ) : null}
            </div>

            <div className="absolute right-4 top-4 z-10">
              <FavoriteButton destinationId={destination.id} size="small" />
            </div>

            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className={cn('rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide', difficultyBadge.className)}>
                {difficultyBadge.label}
              </span>
              <span className="rounded-full border border-white/14 bg-white/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {categoryLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <Link to={`/destinations/${destination.slug}`} className="group/title inline-block">
                    <h3 className="text-3xl leading-tight text-[#173124] transition group-hover/title:text-[#1f5c46]">
                      {destination.name}
                    </h3>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6a5f52]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#8f5b28]" />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe2] px-3 py-1 text-[#61574a]">
                      <Star className="h-4 w-4 fill-[#e0b964] text-[#e0b964]" />
                      {ratingValue}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#d9c8ac] bg-[linear-gradient(180deg,#fffdf8,#f5ebdb)] px-5 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8f5b28]">From</p>
                  <p className="mt-2 text-3xl font-semibold text-[#173124]">{formatCurrency(price)}</p>
                  <p className="mt-1 text-sm text-[#6a5f52]">per traveler</p>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-[#62584b]">{summary}</p>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-[#e7d8be] pt-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-3 text-sm text-[#62584b]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe2] px-4 py-2">
                  <CalendarDays className="h-4 w-4 text-[#1f5c46]" />
                  {destination.duration || 0} days
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f7efe2] px-4 py-2">
                  <Users className="h-4 w-4 text-[#1f5c46]" />
                  Up to {destination.max_people || 20} guests
                </span>
              </div>

              <Button
                asChild
                className="rounded-full bg-[#1f5c46] px-6 text-white hover:bg-[#174635]"
              >
                <Link to={`/destinations/${destination.slug}`}>
                  Explore Route
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-[2.2rem] border border-[#d9c8ac] bg-white/82 shadow-[0_24px_74px_rgba(99,72,31,0.12)] backdrop-blur-sm"
    >
      <div className="relative overflow-hidden">
        <Link to={`/destinations/${destination.slug}`} className="block">
          <div className="relative h-72 overflow-hidden">
            <img src={image} alt={destination.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,14,0.02)_0%,rgba(11,17,14,0.78)_100%)]" />
          </div>
        </Link>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {destination.is_featured ? (
            <Badge className="border-0 bg-[#f0c15c] text-[#173124]">
              <Sparkles className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          ) : null}
          {!destination.is_featured && isNew ? <Badge className="border-0 bg-emerald-500 text-white">New</Badge> : null}
        </div>

        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton destinationId={destination.id} size="small" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <span className={cn('rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide', difficultyBadge.className)}>
            {difficultyBadge.label}
          </span>

          <div className="rounded-[1rem] bg-white/90 px-3 py-2 text-right text-[#173124] shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8f5b28]">From</p>
            <p className="text-lg font-semibold leading-none">{formatCurrency(price)}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/destinations/${destination.slug}`} className="group/title inline-block">
              <h3 className="text-2xl leading-tight text-[#173124] transition group-hover/title:text-[#1f5c46]">
                {destination.name}
              </h3>
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6a5f52]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#8f5b28]" />
                {location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe2] px-3 py-1 text-[#61574a]">
                <Star className="h-4 w-4 fill-[#e0b964] text-[#e0b964]" />
                {ratingValue}
              </span>
            </div>
          </div>

          <Badge className="border border-[#d9c8ac] bg-[#fff8ee] text-[#6b4d1d]">{categoryLabel}</Badge>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#62584b]">{summary}</p>

        <div className="mt-6 flex items-center justify-between border-t border-[#e7d8be] pt-4">
          <div className="flex flex-wrap gap-3 text-sm text-[#62584b]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#1f5c46]" />
              {destination.duration || 0} days
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1f5c46]" />
              {destination.max_people || 20} guests
            </span>
          </div>

          <Link
            to={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5c46] transition hover:text-[#174635]"
          >
            Explore
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border-[#d9c8ac] bg-white/70 px-5 text-[#62584b] hover:bg-white"
      >
        Previous
      </Button>

      {getPageNumbers(currentPage, totalPages).map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-[#8e7f67]">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition',
              currentPage === page
                ? 'bg-[#1f5c46] text-white shadow-lg'
                : 'border border-[#d9c8ac] bg-white/70 text-[#62584b] hover:bg-white'
            )}
          >
            {page}
          </button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border-[#d9c8ac] bg-white/70 px-5 text-[#62584b] hover:bg-white"
      >
        Next
      </Button>
    </div>
  );
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
  const [isPlaying, setIsPlaying] = useState(true);
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
      setError('');

      try {
        const response = await destinationAPI.getAllDestinations(1, 100);
        setDestinations(response.data.data || []);
      } catch (err) {
        setError('Failed to load destinations');
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, viewMode]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const filteredDestinations = useMemo(
    () =>
      destinations.filter((destination) => {
        const query = searchTerm.trim().toLowerCase();
        const searchMatch =
          !query ||
          destination.name?.toLowerCase().includes(query) ||
          destination.city?.toLowerCase().includes(query) ||
          destination.country?.toLowerCase().includes(query);
        const categoryMatch =
          !selectedCategory || String(destination.category?.id) === String(selectedCategory);

        return searchMatch && categoryMatch;
      }),
    [destinations, searchTerm, selectedCategory]
  );

  const totalPages = Math.ceil(filteredDestinations.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedDestinations = filteredDestinations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const featuredCount = destinations.filter((destination) => destination.is_featured).length;

  const summaryCards = [
    { label: 'Routes', value: destinations.length || 0 },
    { label: 'Featured', value: featuredCount || 0 },
    { label: 'Categories', value: categories.length || 0 },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const handleScrollToResults = () => {
    document.getElementById('destination-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((previous) => (previous - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7efe2_50%,#fdf8f1_100%)] text-slate-900">
      <DestinationHero
        currentSlide={currentSlide}
        destinationCount={destinations.length}
        featuredCount={featuredCount}
        categoryCount={categories.length}
        isPlaying={isPlaying}
        onNext={goToNextSlide}
        onPrev={goToPrevSlide}
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
        onGoToSlide={goToSlide}
        onScrollToResults={handleScrollToResults}
      />

      <section id="destination-results" className="relative -mt-14 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredCount={filteredDestinations.length}
            totalCount={destinations.length}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onReset={handleResetFilters}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-end">
            <div>
              <Badge className="rounded-full bg-[#ead8b6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#6b4d1d]">
                Destination Collection
              </Badge>
              <h2 className="mt-5 text-4xl leading-tight text-[#173124] sm:text-5xl">
                Browse Ethiopia with the same warmth and depth as the home page.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#62584b] sm:text-lg">
                Search by place, scan by category, or simply follow the visual mood that fits the kind of trip you want to
                plan next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.6rem] border border-[#d9c8ac] bg-white/76 px-5 py-5 text-center shadow-[0_20px_55px_rgba(99,72,31,0.08)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f5b28]">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#173124]">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {error && destinations.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-rose-200 bg-rose-50/90 px-6 py-8 text-rose-700 shadow-sm">
              <p className="text-lg font-semibold">We couldn&apos;t load the destination collection.</p>
              <p className="mt-2 text-sm leading-7">{error}</p>
            </div>
          ) : null}

          <div className="mt-10">
            {filteredDestinations.length === 0 ? (
              <EmptyState onReset={handleResetFilters} />
            ) : (
              <div
                className={cn(
                  'grid gap-8',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                )}
              >
                {paginatedDestinations.map((destination, index) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>

          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

          <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#123726] px-6 py-10 text-white shadow-[0_30px_110px_rgba(18,55,38,0.32)] sm:px-10 lg:px-12 lg:py-14">
            <div className="absolute" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-center">
              <div className="max-w-2xl">
                <Badge className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                  Need Help Choosing?
                </Badge>
                <h3 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
                  Turn this gallery of places into one clear itinerary.
                </h3>
                <p className="mt-6 text-base leading-8 text-white/78 sm:text-lg">
                  Save favorites, compare the feel of each route, and start shaping a trip that looks as good in planning as
                  it will on arrival.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md">
                <div className="space-y-4">
                  {[
                    'Search with place names, regions, or travel style.',
                    'Switch between grid and list views depending on how you like to browse.',
                    'Open any route for pricing, details, photos, and booking.',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-white/82">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-[#f0c15c] px-6 text-[#183221] hover:bg-[#f6cf7f]"
                  >
                    <Link to="/register">Create an Account</Link>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleScrollToResults}
                    className="rounded-full border-white/20 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white"
                  >
                    Back to Results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Destinations;
