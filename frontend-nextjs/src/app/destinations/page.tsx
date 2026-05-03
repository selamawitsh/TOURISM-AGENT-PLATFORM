'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Compass,
  Grid3x3, LayoutList, MapPin, Mountain, Search, SlidersHorizontal,
  Sparkles, Star, Users, X,
} from 'lucide-react';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn, formatCurrency } from '@/lib/utils';
import { getCategories, getAllDestinations } from '@/lib/api-client';
import { useReveal, useHorizontalDrag } from '@/lib/uiEffects';

const PAGE_SIZE = 9;
const destinationPlaceholder = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1200';

const getDifficultyBadge = (difficulty: string) => {
  const badges: Record<string, { label: string; className: string }> = {
    easy: { label: 'Easy', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    moderate: { label: 'Moderate', className: 'border-amber-200 bg-amber-50 text-amber-800' },
    hard: { label: 'Challenging', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  };
  return badges[(difficulty || 'easy').toLowerCase()] || badges.easy;
};

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
  if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-[#f5ede1]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="relative mx-auto h-24 w-24">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-[#e8d5b7] border-t-[#1f5c46]" />
          <div className="absolute inset-0 flex items-center justify-center"><Mountain className="h-8 w-8 text-[#1f5c46]" /></div>
        </div>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-[#7e725f]">Curating your journey</p>
      </motion.div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#e0d0b8] bg-white/60 backdrop-blur-sm px-6 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f0e6d8] text-[#6b4d1d]"><Compass className="h-10 w-10" /></div>
      <h3 className="mt-6 text-2xl font-semibold text-[#173124]">No destinations found</h3>
      <p className="mx-auto mt-3 max-w-md text-[#6a5f52]">Try adjusting your search or filters to discover more places.</p>
      <button onClick={onReset} className="mt-6 rounded-full bg-[#1f5c46] px-6 py-3 text-white hover:bg-[#174635] transition-colors">Reset filters</button>
    </motion.div>
  );
}

function DestinationHero({ currentSlide, onScrollToResults }: { currentSlide: number; onScrollToResults: () => void }) {
  const activeSlide = heroSlides[currentSlide];
  return (
    <section className="relative h-[60vh] min-h-[360px] lg:h-[85vh] lg:min-h-[600px] max-h-[800px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={activeSlide?.label || 'slide'} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute inset-0">
          <img src={activeSlide?.image || heroSlides[0]?.image} alt={activeSlide?.title || 'Ethiopia'} className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 lg:px-12 lg:pb-16">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              {heroSlides.map((_: any, idx: number) => (
                <div key={idx} className={cn("h-0.5 rounded-full transition-all duration-500", idx === currentSlide ? "w-12 bg-[#f0c15c]" : "w-6 bg-white/40")} />
              ))}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{activeSlide?.title || 'Discover Ethiopia'}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">{activeSlide?.label || 'Timeless landscapes'}...</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={onScrollToResults} className="group rounded-full bg-[#f0c15c] px-8 py-4 text-base font-semibold text-[#173124] shadow-xl hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center">
                Explore Destinations<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="rounded-full border border-white/30 bg-white/10 px-6 py-4 text-base text-white backdrop-blur-sm hover:bg-white/20 transition-all">{heroSlides.length} Curated Routes</button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcf9f4] to-transparent" />
    </section>
  );
}

function SearchFilterBar({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, filteredCount, totalCount, viewMode, setViewMode, onReset }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="sticky top-20 z-40">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#e0d0b8] bg-white/95 shadow-[0_18px_60px_rgba(22,28,22,0.06)] backdrop-blur-xl">
        <div className="flex items-center gap-3 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8e7f67]" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search destinations..."
              className="h-14 w-full rounded-xl border border-[#e0d0b8] bg-white pl-12 pr-4 text-base text-[#173124] focus:ring-2 focus:ring-[#1f5c46]/20 outline-none" />
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all", isExpanded ? "bg-[#1f5c46] text-white" : "bg-white/50 text-[#62584b] hover:bg-white")}>
            {isExpanded ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
          </button>
          <div className="flex rounded-xl bg-white p-1 border border-[#e0d0b8]">
            <button onClick={() => setViewMode('grid')} className={cn("rounded-lg px-3 py-2 transition-all", viewMode === 'grid' ? "bg-white text-[#173124] shadow-sm" : "text-[#776b5c]")}><Grid3x3 className="h-5 w-5" /></button>
            <button onClick={() => setViewMode('list')} className={cn("rounded-lg px-3 py-2 transition-all", viewMode === 'list' ? "bg-white text-[#173124] shadow-sm" : "text-[#776b5c]")}><LayoutList className="h-5 w-5" /></button>
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#e0d0b8] bg-white/98">
              <div className="flex items-center gap-4 p-4">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 rounded-xl border border-[#e0d0b8] bg-white px-4 py-3 text-sm text-[#173124] outline-none">
                  <option value="">All Categories</option>
                  {categories.map((category: any) => (<option key={category.id} value={String(category.id)}>{category.name}</option>))}
                </select>
                <button onClick={onReset} className="rounded-xl bg-white/50 px-6 py-3 text-sm hover:bg-gray-100 transition-colors">Reset</button>
              </div>
              <div className="border-t border-[#e0d0b8] px-4 py-3 text-sm text-[#62584b]">Showing {filteredCount} of {totalCount} destinations</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function DestinationCard({ destination, index, viewMode }: any) {
  const price = Number(destination?.discount_price) > 0 ? Number(destination.discount_price) : Number(destination?.price_per_person) || 0;
  const ratingValue = Number(destination?.rating) > 0 ? Number(destination.rating).toFixed(1) : '4.8';
  const difficultyBadge = getDifficultyBadge(destination?.difficulty);
  const location = [destination?.city, destination?.country].filter(Boolean).join(', ') || 'Ethiopia';
  const image = destination?.main_image || destinationPlaceholder;

  if (viewMode === 'list') {
    return (
      <motion.article initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
        whileHover={{ x: 4 }} className="group overflow-hidden rounded-2xl border border-[#e8d5b7] bg-white shadow-lg hover:shadow-xl transition-all">
        <div className="grid gap-6 sm:grid-cols-[280px,1fr]">
          <Link href={`/destinations/${destination.slug}`} className="relative block h-full min-h-[200px] overflow-hidden">
            <img src={image} alt={destination.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {destination.is_featured && <span className="absolute left-3 top-3 bg-[#f0c15c] text-[#173124] text-xs px-2.5 py-1 rounded-full"><Sparkles className="mr-1 h-3 w-3 inline" />Featured</span>}
          </Link>
          <div className="flex flex-col justify-between p-6">
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Link href={`/destinations/${destination.slug}`}><h3 className="text-2xl font-bold text-[#173124] hover:text-[#1f5c46]">{destination.name}</h3></Link>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#6a5f52]"><MapPin className="h-4 w-4" />{location}</p>
                </div>
                <div className="text-right"><p className="text-2xl font-bold text-[#173124]">{formatCurrency(price)}</p><p className="text-xs text-[#6a5f52]">per person</p></div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", difficultyBadge.className)}>{difficultyBadge.label}</span>
                <span className="flex items-center gap-1 rounded-full bg-[#f5ede1] px-3 py-1 text-xs"><Star className="h-3 w-3 fill-[#e0b964] text-[#e0b964]" />{ratingValue}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#e8d5b7] pt-4">
              <div className="flex gap-4 text-sm text-[#62584b]"><span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{destination.duration || 5} days</span><span className="flex items-center gap-1"><Users className="h-4 w-4" />{destination.max_people || 20} guests</span></div>
              <Link href={`/destinations/${destination.slug}`} className="flex items-center gap-2 font-semibold text-[#1f5c46] hover:text-[#174635]">View Details<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ y: -4 }} className="group overflow-hidden rounded-2xl border border-[#e8d5b7] bg-white shadow-lg hover:shadow-2xl transition-all">
      <Link href={`/destinations/${destination.slug}`} className="relative block h-64 overflow-hidden">
        <img src={image} alt={destination.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {destination.is_featured && <span className="bg-[#f0c15c] text-[#173124] text-xs px-2.5 py-1 rounded-full"><Sparkles className="mr-1 h-3 w-3 inline" />Featured</span>}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-[#6a5f52]">From</p>
          <p className="text-lg font-bold text-[#173124]">{formatCurrency(price)}</p>
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-3">
          <Link href={`/destinations/${destination.slug}`}><h3 className="text-xl font-bold text-[#173124] hover:text-[#1f5c46]">{destination.name}</h3></Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-[#6a5f52]"><MapPin className="h-3.5 w-3.5" />{location}</p>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", difficultyBadge.className)}>{difficultyBadge.label}</span>
          <span className="flex items-center gap-1 text-sm text-[#6a5f52]"><Star className="h-4 w-4 fill-[#e0b964] text-[#e0b964]" />{ratingValue}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#e8d5b7] pt-4">
          <div className="flex items-center gap-3 text-xs text-[#62584b]"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{destination.duration || 5}d</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{destination.max_people || 20}</span></div>
          <Link href={`/destinations/${destination.slug}`} className="text-sm font-semibold text-[#1f5c46] hover:text-[#174635]">Explore</Link>
        </div>
      </div>
    </motion.article>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: any) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="rounded-full p-2 text-[#62584b] hover:bg-[#f0e6d8] disabled:opacity-30 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
      {getPageNumbers(currentPage, totalPages).map((page, idx) => page === '...' ? <span key={idx} className="px-2 text-[#8e7f67]">...</span> : (
        <button key={page} onClick={() => onPageChange(page)}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all", currentPage === page ? "bg-[#1f5c46] text-white shadow-lg" : "text-[#62584b] hover:bg-[#f0e6d8]")}>{page}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="rounded-full p-2 text-[#62584b] hover:bg-[#f0e6d8] disabled:opacity-30 transition-colors"><ChevronRight className="h-5 w-5" /></button>
    </div>
  );
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const topDestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const loadAllData = async () => {
      setLoading(true);
      setError('');
      try {
        const catRes = await getCategories();
        const cats = catRes?.data || catRes || [];
        if (mounted) setCategories(Array.isArray(cats) ? cats : []);

        await new Promise(r => setTimeout(r, 500));

        const destRes = await getAllDestinations(1, 100);
        const dests = destRes?.data?.data || destRes?.data || destRes || [];
        if (mounted) setDestinations(Array.isArray(dests) ? dests : []);
      } catch (err) {
        if (mounted) setError('Failed to load destinations. Please refresh.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAllData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { setPage(1); }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, []);

  useReveal();
  useHorizontalDrag(topDestRef);

  const filteredDestinations = useMemo(() => {
    if (!destinations.length) return [];
    return destinations.filter((d) => {
      const query = searchTerm.trim().toLowerCase();
      const searchMatch = !query || d.name?.toLowerCase().includes(query) || d.city?.toLowerCase().includes(query) || d.country?.toLowerCase().includes(query);
      const categoryMatch = !selectedCategory || String(d.category?.id) === String(selectedCategory);
      return searchMatch && categoryMatch;
    });
  }, [destinations, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedDestinations = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDestinations.slice(start, start + PAGE_SIZE);
  }, [filteredDestinations, safePage]);

  const handleResetFilters = useCallback(() => { setSearchTerm(''); setSelectedCategory(''); }, []);
  const handleScrollToResults = useCallback(() => {
    document.getElementById('destination-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const handlePageChange = useCallback((newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-[#f5ede1] p-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600"><Compass className="h-10 w-10" /></div>
          <h3 className="mt-6 text-2xl font-semibold text-[#173124]">Oops! Something went wrong</h3>
          <p className="mx-auto mt-3 max-w-md text-[#6a5f52]">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-[#1f5c46] px-8 py-4 text-white">Try Again</button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      <DestinationHero currentSlide={currentSlide} onScrollToResults={handleScrollToResults} />

      {categories.length > 0 && (
        <section className="-mt-8 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div ref={topDestRef} className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
              <button onClick={() => setSelectedCategory('')} className={cn("shrink-0 rounded-full border px-6 py-3 text-sm font-medium transition-all", selectedCategory === '' ? "border-[#1f5c46] bg-[#1f5c46] text-white shadow-lg" : "border-[#e0d0b8] bg-white/80 text-[#62584b] hover:border-[#1f5c46] hover:shadow-md")}>All</button>
              {categories.slice(0, 8).map((category) => (
                <button key={category.id} onClick={() => setSelectedCategory(String(category.id))} className={cn("shrink-0 rounded-full border px-6 py-3 text-sm font-medium transition-all", selectedCategory === String(category.id) ? "border-[#1f5c46] bg-[#1f5c46] text-white shadow-lg" : "border-[#e0d0b8] bg-white/80 text-[#62584b] hover:border-[#1f5c46] hover:shadow-md")}>{category.name}</button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="destination-results" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SearchFilterBar
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            categories={categories} filteredCount={filteredDestinations.length} totalCount={destinations.length}
            viewMode={viewMode} setViewMode={setViewMode} onReset={handleResetFilters}
          />
          <div className="mt-8">
            {filteredDestinations.length === 0 ? <EmptyState onReset={handleResetFilters} /> : (
              <>
                <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
                  {paginatedDestinations.map((destination, index) => <DestinationCard key={destination.id} destination={destination} index={index} viewMode={viewMode} />)}
                </div>
                <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
