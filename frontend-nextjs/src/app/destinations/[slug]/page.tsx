'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CalendarDays, Clock, MapPin, ShieldCheck, Sparkles, Star,
  Users, Heart, Share2, ChevronRight, Award, Camera, Coffee, Mountain,
  Hotel, Utensils, Info,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getDestinationBySlug } from '@/lib/api-client';

const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';
const AI_URL = 'https://ai-service-06yq.onrender.com/api/v1';
const destinationPlaceholder = 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1600';

const getDifficultyColor = (difficulty: string) => {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'moderate': return 'bg-amber-50 text-amber-800 border-amber-100';
    case 'hard': return 'bg-rose-50 text-rose-700 border-rose-100';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  const normalized = (difficulty || 'easy').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3 } }
};

function DestinationEnhancement({ destination }: { destination: any }) {
  const [enhanced, setEnhanced] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!destination?.id || hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    fetch(`${AI_URL}/ai/enhance-destination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination_id: String(destination.id),
        destination_name: destination.name,
        city: destination.city || '',
        country: destination.country || '',
        description: destination.description || '',
      }),
    })
      .then((res) => res.json())
      .then((data) => setEnhanced(data?.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [destination?.id]);

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
        <div className="text-sm text-[#6a5f52]">{enhanced.history?.slice(0, 120)}{enhanced.history?.length > 120 ? '...' : ''}</div>
      ) : (
        <div className="space-y-6 mt-6">
          {enhanced.history && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border">
              <h4 className="font-bold text-[#173124] mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> History & Culture</h4>
              <p className="text-sm text-[#6a5f52] leading-relaxed">{enhanced.history}</p>
            </div>
          )}
          {enhanced.hotels?.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border">
              <h4 className="font-bold text-[#173124] mb-3"><Hotel className="h-4 w-4 inline mr-2" /> Accommodations</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {enhanced.hotels.slice(0, 3).map((h: any, i: number) => (
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
              <p className="text-sm text-[#6a5f52]">Best: {typeof enhanced.weather === 'string' ? enhanced.weather : enhanced.weather.best_time || 'October to March'}</p>
            </div>
          )}
          {enhanced.restaurants?.length > 0 && (
            <div className="bg-white rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2"><Utensils className="h-4 w-4 inline mr-2" /> Where to Eat</h4>
              <ul className="text-sm text-[#6a5f52] space-y-2">
                {enhanced.restaurants.slice(0, 4).map((r: any, i: number) => (<li key={i}>{r.name} <span className="text-xs text-gray-400">{r.cuisine}</span></li>))}
              </ul>
            </div>
          )}
          {enhanced.tips?.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[1.5rem] p-4">
              <h4 className="font-bold text-[#173124] mb-2">Travel Tips</h4>
              <ul className="text-sm text-[#6a5f52] list-disc pl-4 space-y-1">
                {enhanced.tips.slice(0, 6).map((t: string, i: number) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasFetched = useRef(false);

  useEffect(() => {
    hasFetched.current = false;
    const load = async () => {
      if (!slug || hasFetched.current) return;
      hasFetched.current = true;
      setLoading(true);
      try {
        const res = await getDestinationBySlug(slug);
        const data = res?.data || res;
        if (data) setDestination(data);
        else setError('Destination not found');
      } catch {
        setError('Failed to load destination');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleBookNow = useCallback(() => {
    if (destination?.id) router.push(`/book/${destination.id}`);
  }, [router, destination?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
        <div className="h-[50vh] w-full bg-gray-200 animate-pulse" />
        <section className="mx-auto max-w-7xl px-6 lg:px-8 -mt-20"><div className="rounded-2xl bg-white/90 p-6 shadow-sm"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => (<div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />))}</div></div></section>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf9f4] to-[#f5ede1] p-6">
        <motion.div initial="hidden" animate="visible" variants={scaleIn} className="w-full max-w-lg">
          <div className="overflow-hidden rounded-[2.5rem] border-0 bg-white/80 backdrop-blur-sm shadow-2xl text-center p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 text-[#1f5c46] mb-6"><MapPin className="h-10 w-10" /></div>
            <h3 className="text-3xl font-bold text-[#173124] mb-3">Route Not Found</h3>
            <p className="text-[#6a5f52] mb-8">{error || 'This journey may have been moved.'}</p>
            <Link href="/destinations" className="inline-flex items-center gap-2 rounded-full bg-[#1f5c46] hover:bg-[#174635] text-white px-8 py-4 font-semibold">Explore Collection<ChevronRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const mainImage = destination?.main_image || destinationPlaceholder;
  const shortDescription = destination?.short_description || destination?.description || 'A guided Ethiopian journey.';
  const difficultyLabel = getDifficultyLabel(destination?.difficulty);
  const activePrice = destination?.discount_price > 0 ? Number(destination.discount_price) : Number(destination?.price_per_person) || 0;
  const maxGuests = Math.max(Number(destination?.max_people) || 1, 1);
  const safeGuests = Math.min(Math.max(guests, 1), maxGuests);
  const estimatedTotal = activePrice * safeGuests;
  const ratingValue = Number(destination?.rating) > 0 ? Number(destination.rating).toFixed(1) : '4.9';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      <section className="relative h-[55vh] lg:h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeImageIndex} initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute inset-0">
            <img src={mainImage} alt={destination.name} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f4] via-transparent to-transparent" />
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="absolute top-6 left-6 lg:left-12 z-20 flex items-center gap-4">
          <Link href="/destinations" className="group flex items-center gap-3 rounded-full bg-black/30 backdrop-blur-xl px-5 py-3 text-white border border-white/20 hover:bg-black/40 hover:scale-105 transition-all"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Back to Collection</span></Link>
        </motion.div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-8 space-y-6">
            <motion.div variants={fadeUp} className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl border border-white/40">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {destination.is_featured && <span className="bg-gradient-to-r from-[#f0c15c] to-amber-400 text-[#173124] font-bold text-xs px-4 py-2 rounded-full"><Sparkles size={12} className="mr-1 inline" /> Featured</span>}
                  {destination.category?.name && <span className="bg-emerald-50 text-emerald-800 font-bold text-xs px-4 py-2 rounded-full">{destination.category.name}</span>}
                </div>
                <div className="flex items-center gap-2 bg-amber-50 rounded-full px-4 py-2"><Star className="h-4 w-4 text-amber-500" fill="currentColor" /><span className="font-bold text-amber-900">{ratingValue}</span></div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#173124] leading-[1.1] mb-4">{destination.name}</h1>
              <p className="flex items-center gap-2 text-[#6a5f52] font-medium mb-8"><MapPin size={18} className="text-emerald-700" />{[destination.city, destination.country].filter(Boolean).join(', ')}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[{ label: 'Duration', value: `${destination.duration || 0} Days`, icon: Clock },{ label: 'Group', value: `Up to ${maxGuests}`, icon: Users },{ label: 'Difficulty', value: difficultyLabel, icon: Award },{ label: 'From', value: formatCurrency(activePrice), icon: Sparkles }].map((item, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} className={cn("rounded-2xl p-4 border transition-all", i === 2 ? getDifficultyColor(destination.difficulty) : "bg-gradient-to-br from-white to-zinc-50 border-zinc-100")}><item.icon className="text-emerald-700 mb-2" size={20} /><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{item.label}</p><p className="font-bold text-[#173124]">{item.value}</p></motion.div>
                ))}
              </div>
              <p className="text-xl text-[#6a5f52] leading-relaxed font-light italic border-l-4 border-[#1f5c46] pl-6 mb-6">{shortDescription}</p>
              <div className="text-[#62584b] leading-relaxed space-y-4">{destination.description?.split('\n').map((p: string, i: number) => (<p key={i}>{p}</p>))}</div>
            </motion.div>

            <DestinationEnhancement destination={destination} />

            {(destination.included?.length > 0 || destination.excluded?.length > 0) && (
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                {destination.included?.length > 0 && (<div className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-lg"><h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-6">Included</h3><ul className="space-y-2">{destination.included.slice(0, 5).map((item: string, i: number) => (<li key={i} className="flex items-center gap-3 text-sm text-[#173124]"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{item}</li>))}</ul></div>)}
                {destination.excluded?.length > 0 && (<div className="bg-white rounded-[2rem] p-8 border border-rose-100 shadow-lg"><h3 className="text-sm font-bold uppercase tracking-wider text-rose-800 mb-6">Not Included</h3><ul className="space-y-2">{destination.excluded.slice(0, 5).map((item: string, i: number) => (<li key={i} className="flex items-center gap-3 text-sm text-[#173124]"><div className="h-1.5 w-1.5 rounded-full bg-rose-400" />{item}</li>))}</ul></div>)}
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={slideInRight} initial="hidden" animate="visible" className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                <div className="bg-gradient-to-br from-[#173124] to-[#1f5c46] p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-2">Journey Price</p><div className="flex items-baseline gap-3"><span className="text-5xl font-bold">{formatCurrency(activePrice)}</span>{destination.discount_price > 0 && <span className="text-white/50 line-through text-lg">{formatCurrency(destination.price_per_person)}</span>}</div><p className="text-white/60 text-sm mt-2">per person</p></div>
                <div className="p-6 space-y-5">
                  <div><label className="text-xs font-bold uppercase tracking-wider text-[#6a5f52] mb-2 block">Select Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 focus:ring-2 focus:ring-emerald-500/20 outline-none" /></div>
                  <div><label className="text-xs font-bold uppercase tracking-wider text-[#6a5f52] mb-2 block">Guests</label><div className="flex items-center gap-2"><button onClick={() => setGuests(Math.max(1, guests - 1))} className="h-12 w-12 rounded-xl border bg-zinc-50 text-xl font-bold hover:bg-zinc-100">-</button><input type="number" min={1} max={maxGuests} value={safeGuests} onChange={(e) => { const val = parseInt(e.target.value); setGuests(isNaN(val) ? 1 : Math.min(maxGuests, Math.max(1, val))); }} className="h-12 flex-1 rounded-xl border bg-zinc-50 text-center font-bold outline-none" /><button onClick={() => setGuests(Math.min(maxGuests, guests + 1))} className="h-12 w-12 rounded-xl border bg-zinc-50 text-xl font-bold hover:bg-zinc-100">+</button></div></div>
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4"><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-[#6a5f52]">Base price</span><span>{formatCurrency(activePrice)}</span></div><div className="flex justify-between"><span className="text-[#6a5f52]">Guests</span><span>x {safeGuests}</span></div><div className="pt-2 border-t flex justify-between font-bold"><span className="text-[#173124]">Total</span><span className="text-xl text-[#1f5c46]">{formatCurrency(estimatedTotal)}</span></div></div></div>
                  <button onClick={handleBookNow} className="w-full h-12 rounded-full bg-gradient-to-r from-[#1f5c46] to-[#174635] text-white font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">Reserve Now<ChevronRight className="h-4 w-4" /></button>
                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-[#6a5f52]"><span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" />Secure Booking</span><span className="flex items-center gap-1"><Award size={14} className="text-emerald-600" />Best Price</span></div>
                </div>
              </div>
              <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border shadow-lg"><div className="flex items-center gap-4"><div className="rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 p-3"><Coffee className="h-6 w-6 text-[#1f5c46]" /></div><div><h4 className="font-bold text-[#173124]">Local Expert Guide</h4><p className="text-sm text-[#6a5f52]">Authentic Ethiopian experience</p></div></div></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
