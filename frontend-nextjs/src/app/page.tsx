'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useReveal, useParallax } from '@/lib/uiEffects';
import { getFeaturedDestinations } from '@/lib/api-client';
import { formatCurrency, cn } from '@/lib/utils';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import {
  ArrowRight, Camera, ChevronLeft, ChevronRight, Coffee, Compass, MapPin, Mountain,
  Pause, Play, ShieldCheck, Sparkles, Star, Users, Globe, Music, Palette, LayoutDashboard, X, Heart,
} from 'lucide-react';

const heroSignals = [
  { value: 'Culture-first', label: 'Journeys shaped around living traditions and sacred places.' },
  { value: 'Scenic pacing', label: 'Routes designed to feel spacious and cinematic on the ground.' },
  { value: 'Locally inspired', label: 'Iconic highlights balanced with personal, local details.' },
];

const featuredJourneys = [
  { ...heroSlides[1], eyebrow: 'Sacred heritage' },
  { ...heroSlides[0], eyebrow: 'Highland adventure' },
  { ...heroSlides[5], eyebrow: 'Living culture' },
];

const planningPillars = [
  { icon: Mountain, title: 'Epic Contrast', description: 'Move from alpine trails to volcanic plains in a single, calm rhythm.', iconStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { icon: Coffee, title: 'Deep Roots', description: 'Coffee ceremonies and sacred architecture define each stop.', iconStyle: 'bg-amber-50 text-amber-700 border-amber-100' },
  { icon: Camera, title: 'Cinematic', description: 'Golden light and dramatic horizons made for unforgettable memories.', iconStyle: 'bg-sky-50 text-sky-700 border-sky-100' },
];

const cultures = [
  {
    icon: Coffee, title: 'Ethiopian Cuisine', 
    shortDesc: 'From injera to wat, the coffee ceremony, and communal dining traditions that make every meal a celebration.',
    fullDesc: 'Ethiopian cuisine is one of the most unique and flavorful in Africa. The cornerstone is injera, a spongy sourdough flatbread made from teff flour, which serves as both plate and utensil. Topped with colorful wats (stews) like Doro Wat (spicy chicken), Misir Wat (red lentils), and Shiro (chickpea stew), every meal is a communal experience. The traditional coffee ceremony is an essential part of Ethiopian hospitality, where green coffee beans are roasted, ground, and brewed in a ritual that can last hours.',
    image: 'https://i.pinimg.com/736x/3c/4e/8d/3c4e8d68aba0c8d4d9e404564dc6ef35.jpg',
    highlights: ['Injera & Wat', 'Coffee Ceremony', 'Tej (Honey Wine)', 'Tibs', 'Kitfo'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Music, title: 'Festivals & Music',
    shortDesc: 'Timket, Meskel, and regional celebrations with ancient rhythms, colorful processions, and sacred rituals.',
    fullDesc: "Ethiopia's festival calendar is filled with vibrant celebrations that blend ancient traditions with Christian and Islamic heritage. Timket (Epiphany) features colorful processions with priests carrying sacred Tabots. Meskel (Finding of the True Cross) lights up the night with massive bonfires. Each festival offers a window into the deep spiritual and communal bonds of Ethiopian society.",
    image: 'https://i.pinimg.com/1200x/14/92/e6/1492e6475e59bc04112ee0411d4aeaa8.jpg',
    highlights: ['Timket (Epiphany)', 'Meskel (True Cross)', 'Enkutatash (New Year)', 'Fichee-Chambalaalla', 'Genna (Christmas)'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Palette, title: 'Arts & Crafts',
    shortDesc: 'Handwoven textiles, intricate pottery, silver jewelry, and illuminated manuscripts spanning centuries of mastery.',
    fullDesc: 'Ethiopia has a rich artistic heritage spanning millennia. From the intricate illuminated manuscripts of the Ethiopian Orthodox Church to the distinctive crosses and icons, religious art forms a cornerstone of visual culture. Handwoven cotton garments like the Habesha Kemis feature elaborate tibeb (border patterns). Silver and gold smiths craft elaborate jewelry that signifies status and identity.',
    image: 'https://i.pinimg.com/736x/95/39/03/953903aea9108d470b6c10c4dc9d6cb4.jpg',
    highlights: ['Handwoven Textiles', 'Pottery & Ceramics', 'Silver/Gold Jewelry', 'Illuminated Manuscripts', 'Basket Weaving'],
    color: 'from-emerald-500 to-teal-500',
  },
];

const tourTypes = [
  { icon: Mountain, title: 'Adventure', desc: 'Trek highlands, descend into volcanic craters, and raft mighty rivers.', image: 'https://i.pinimg.com/736x/f7/bc/c4/f7bcc4bb5a5e745a19c20f9cd412f92f.jpg', link: '/destinations?difficulty=hard', color: 'from-red-500 to-orange-500' },
  { icon: Compass, title: 'Cultural', desc: 'Meet ancient tribes, witness sacred ceremonies, and learn timeless crafts.', image: 'https://i.pinimg.com/1200x/0d/27/d0/0d27d02bf52155bbe2fb13e8475ea9fa.jpg', link: '/destinations?difficulty=moderate', color: 'from-purple-500 to-pink-500' },
  { icon: Camera, title: 'Historical', desc: 'Walk through 3,000 years at rock-hewn churches, ancient stelae, and castle ruins.', image: 'https://i.pinimg.com/1200x/b6/24/53/b6245302eba3ec3830fac8493c7464ad.jpg', link: '/destinations?difficulty=easy', color: 'from-amber-500 to-yellow-500' },
];

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration * 60);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else { setCount(Math.floor(start)); }
          }, 1000 / 60);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [selectedCulture, setSelectedCulture] = useState<any>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setActiveSlide((c) => (c + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    getFeaturedDestinations(6).then(res => {
      const d = res?.data?.data || res?.data || res || [];
      setDestinations(Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  useParallax(parallaxRef, 0.12);
  useReveal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFAF7] via-white to-[#FCFAF7] text-slate-900">
      {/* HERO */}
      <section className="relative min-h-[65vh] lg:min-h-screen w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 parallax-hero" ref={parallaxRef}>
          {heroSlides.map((slide, index) => (
            <div key={slide.label} className={cn('absolute inset-0 transition-opacity duration-1000', index === activeSlide ? 'opacity-100' : 'opacity-0')}>
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="relative z-20 mx-auto w-full max-w-7xl px-6 py-8 lg:py-40 text-center text-white">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"><Sparkles size={16} className="text-[#f0c15c]" /><span className="text-sm">Discover the Land of Origins</span></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight lg:text-6xl">Ethiopia Timeless landscapes,<br /><span className="bg-gradient-to-r from-[#f0c15c] to-amber-300 bg-clip-text text-transparent">crafted journeys</span></h1>
            <p className="mt-4 text-base sm:text-lg text-white/90 max-w-3xl mx-auto">Curated routes that balance culture, comfort, and cinematic scenery.</p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/destinations" className="bg-[#f0c15c] text-[#173124] px-6 py-3 sm:px-8 sm:py-4 font-bold rounded-full shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">Explore Routes<ArrowRight size={18} /></Link>
              {isAuthenticated ? (
                <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="bg-white/90 backdrop-blur-sm text-[#0f2d20] px-4 py-2 sm:px-6 sm:py-3 font-semibold rounded-full hover:bg-white transition-all inline-flex items-center gap-2"><LayoutDashboard size={18} /> My Dashboard</Link>
              ) : (
                <Link href="/register" className="bg-white/90 backdrop-blur-sm text-[#0f2d20] px-4 py-2 sm:px-6 sm:py-3 font-semibold rounded-full hover:bg-white">Get Started</Link>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-12">
              {heroSlides.map((_, idx) => (<button key={idx} onClick={() => setActiveSlide(idx)} className={cn("h-1.5 rounded-full transition-all", idx === activeSlide ? "w-8 bg-[#f0c15c]" : "w-1.5 bg-white/40")} />))}
              <button onClick={() => setIsPlaying(!isPlaying)} className="ml-4 p-2 rounded-full bg-white/10">{isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}</button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE JOURNEYS */}
      <section data-reveal className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-4xl"><div className="flex items-center gap-3 mb-4"><div className="h-px w-12 bg-emerald-300" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">The Collection</span></div><h2 className="text-4xl font-bold text-zinc-900 sm:text-5xl lg:text-6xl">Signature <span className="text-emerald-800">Journeys</span></h2></div>
            <p className="max-w-2xl text-zinc-500 leading-relaxed text-lg">Curated experiences that balance spiritual heritage with the raw power of the Ethiopian landscape.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 relative h-[520px] overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-2xl group">
              <img src={featuredJourneys[activeFeatured].image} alt={featuredJourneys[activeFeatured].title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
              <div className="absolute left-8 top-8"><span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm"><Sparkles size={14} className="mr-2 inline" />{featuredJourneys[activeFeatured].eyebrow}</span></div>
              <div className="absolute inset-0 flex flex-col justify-end p-10 text-white"><h3 className="text-4xl font-bold mb-4">{featuredJourneys[activeFeatured].title}</h3><p className="max-w-2xl text-base text-white/90 mb-6">{featuredJourneys[activeFeatured].label}</p>
                <div className="flex items-center gap-4"><Link href="/destinations" className="rounded-full bg-white/95 text-emerald-900 px-6 py-3 font-bold hover:bg-white inline-flex items-center gap-2">Explore routes<ArrowRight size={16} /></Link><button onClick={() => setActiveFeatured((v) => (v + 1) % featuredJourneys.length)} className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full">Next Journey</button></div>
              </div>
              <button onClick={() => setActiveFeatured((v) => (v - 1 + featuredJourneys.length) % featuredJourneys.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"><ChevronLeft size={24} /></button>
              <button onClick={() => setActiveFeatured((v) => (v + 1) % featuredJourneys.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"><ChevronRight size={24} /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">{featuredJourneys.map((_, idx) => (<button key={idx} onClick={() => setActiveFeatured(idx)} className={cn("h-1 rounded-full", idx === activeFeatured ? "w-6 bg-white" : "w-1.5 bg-white/40")} />))}</div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6">
              {featuredJourneys.map((journey, i) => (
                <article key={journey.label} onMouseEnter={() => setActiveFeatured(i)} className={cn("group relative flex cursor-pointer overflow-hidden rounded-[1.5rem] bg-zinc-100 transition-all duration-500 hover:scale-[1.02] shadow-lg", activeFeatured === i && "ring-2 ring-[#f0c15c]")}>
                  <img src={journey.image} alt={journey.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-zinc-950/30 to-transparent" />
                  <div className="relative p-6 flex items-end h-40"><div className="w-full"><span className="text-[10px] font-bold uppercase tracking-widest text-[#f0c15c] mb-2 block">{journey.eyebrow}</span><h4 className="text-xl font-bold text-white">{journey.title}</h4></div></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section data-reveal className="bg-gradient-to-b from-white via-zinc-50/50 to-white py-24 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"><div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl" /><div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl" /></div>
        <div className="mx-auto max-w-7xl relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-sm px-4 py-2 rounded-full"><ShieldCheck size={14} className="mr-2 inline" />Why Travel With Us</span>
              <h2 className="mt-6 text-4xl font-bold text-zinc-900 sm:text-5xl">Travel planning built for <span className="bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent italic">intentional explorers.</span></h2>
              <p className="mt-8 text-lg text-zinc-600">We pair visual drama with structured, thoughtful design.</p>
              <div className="mt-12 space-y-4">
                {[{ title: 'Curated local insights', desc: 'Authentic experiences guided by community knowledge' }, { title: 'Spacious, scenic pacing', desc: 'Routes designed for immersion, not rushing' }, { title: 'Boutique accommodation focus', desc: 'Handpicked stays that reflect local character' }].map((item) => (
                  <div key={item.title} className="flex items-start gap-4"><div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-600" /></div><div><span className="font-semibold text-zinc-800">{item.title}</span><p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p></div></div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {planningPillars.map((pillar) => (
                <div key={pillar.title} className="group overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1">
                  <div className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 mb-6 transition-all group-hover:scale-110", pillar.iconStyle)}><pillar.icon size={32} /></div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-3">{pillar.title}</h3>
                  <p className="text-base text-zinc-600">{pillar.description}</p>
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full group-hover:w-20 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      {destinations.length > 0 && (
        <section data-reveal className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[3rem] bg-gradient-to-br from-[#fffaf2] via-white to-[#f7efe2] p-8 md:p-12 shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <div><div className="flex items-center gap-3 mb-3"><Compass size={20} className="text-emerald-700" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Destinations</span></div><h2 className="text-4xl font-bold text-zinc-900">Explore our curated routes</h2></div>
                <Link href="/destinations" className="group flex items-center gap-2 text-sm font-semibold text-[#1f5c46] hover:text-emerald-800">View all<ArrowRight size={16} className="group-hover:translate-x-1" /></Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.slice(0, 3).map((d: any) => (
                  <Link key={d.id} href={`/destinations/${d.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden"><img src={d.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1200'} alt={d.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" /><div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90 text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"><MapPin size={14} /><span>{[d.city, d.country].filter(Boolean).join(', ') || 'Ethiopia'}</span></div></div>
                    <div className="p-5"><div className="flex items-start justify-between mb-2"><h3 className="text-xl font-bold text-[#173124]">{d.name}</h3><div className="flex items-center gap-1 text-amber-500"><Star size={16} fill="currentColor" /><span className="text-sm font-semibold">{d.rating || '4.9'}</span></div></div><div className="mt-4 flex items-center justify-between"><span className="text-2xl font-bold text-[#173124]">{formatCurrency(d.discount_price || d.price_per_person || 0)}</span><span className="text-xs text-zinc-500">per person</span></div></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TOURS */}
      <section data-reveal className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><div className="flex items-center justify-center gap-3 mb-4"><Compass className="h-5 w-5 text-emerald-700" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Experiences</span></div><h2 className="text-4xl font-bold text-zinc-900">Tours & Experiences</h2><p className="mt-4 text-zinc-500 max-w-3xl mx-auto">Handcrafted journeys across Ethiopia</p></div>
          <div className="grid gap-6 md:grid-cols-3">
            {tourTypes.map((tour) => (
              <Link key={tour.title} href={tour.link} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden"><img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /><div className={`absolute top-4 left-4 p-3 rounded-xl bg-gradient-to-br ${tour.color}`}><tour.icon className="h-5 w-5 text-white" /></div><div className="absolute bottom-4 left-4 text-white"><h3 className="text-xl font-bold">{tour.title}</h3></div></div>
                <div className="p-5"><p className="text-gray-600 text-sm">{tour.desc}</p><span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium mt-3 group-hover:text-emerald-700">Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CULTURES */}
      <section data-reveal className="py-20 px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><div className="flex items-center justify-center gap-3 mb-4"><Music className="h-5 w-5 text-emerald-700" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Heritage</span></div><h2 className="text-4xl font-bold text-zinc-900">Cultures of Ethiopia</h2><p className="mt-4 text-zinc-500 max-w-3xl mx-auto">Rich traditions spanning over 3,000 years</p></div>
          <div className="grid gap-6 md:grid-cols-3">
            {cultures.map((c) => (
              <motion.div key={c.title} whileHover={{ y: -6 }} onClick={() => setSelectedCulture(c)} className="group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                <div className="relative h-64 sm:h-72 overflow-hidden"><img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /><div className={`absolute top-4 left-4 p-3 rounded-xl bg-gradient-to-br ${c.color}`}><c.icon className="h-5 w-5 text-white" /></div><div className="absolute bottom-4 left-4 text-white"><h3 className="text-xl font-bold">{c.title}</h3></div></div>
                <div className="p-5"><p className="text-gray-600 text-sm leading-relaxed">{c.shortDesc}</p><span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium mt-3">Discover More <ArrowRight className="h-4 w-4" /></span></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT with Animated Counters */}
      <section data-reveal className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><div className="flex items-center justify-center gap-3 mb-4"><Globe className="h-5 w-5 text-emerald-700" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Our Story</span></div><h2 className="text-4xl font-bold text-zinc-900">About Ethiopia Tours</h2><p className="mt-4 text-zinc-500 max-w-2xl mx-auto">Born from a deep love for Ethiopia</p></div>
          
          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { end: 50, suffix: '+', label: 'Expert Guides', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
              { end: 100, suffix: '+', label: 'Destinations', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
              { end: 10000, suffix: '+', label: 'Happy Travelers', icon: Heart, color: 'text-rose-600 bg-rose-50' },
              { end: 15, suffix: '+', label: 'Languages', icon: Globe, color: 'text-amber-600 bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}><stat.icon className="h-7 w-7" /></div>
                <p className="text-3xl font-bold text-gray-900"><AnimatedCounter end={stat.end} />{stat.suffix}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              { icon: MapPin, title: 'Local Expertise', desc: 'Guided by locals who know every hidden gem and cultural treasure across Ethiopia.' },
              { icon: Heart, title: 'Community First', desc: '15% of every booking reinvested directly into local communities and heritage preservation.' },
              { icon: ShieldCheck, title: 'Safe Travel', desc: 'Certified guides, inspected vehicles, and carefully planned routes for worry-free adventure.' },
            ].map((v) => (
              <div key={v.title} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"><v.icon className="h-7 w-7 text-emerald-600" /></div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Detail Modal */}
      <AnimatePresence>
        {selectedCulture && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCulture(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-52 overflow-hidden rounded-t-3xl">
                <img src={selectedCulture.image} alt={selectedCulture.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button onClick={() => setSelectedCulture(null)} className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50"><X className="h-5 w-5" /></button>
                <div className="absolute bottom-4 left-6 text-white">
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${selectedCulture.color} mb-2`}><selectedCulture.icon className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold">{selectedCulture.title}</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-gray-700 leading-relaxed">{selectedCulture.fullDesc}</p>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Key Highlights</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedCulture.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${selectedCulture.color}`} />
                        <span className="text-sm text-gray-700">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/destinations" className="block w-full text-center py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-600">Explore Destinations</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-200/60 text-center bg-gradient-to-t from-zinc-50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4"><Mountain size={20} className="text-emerald-700" /><span className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">Ethiopia</span></div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-2">Ethiopia &bull; Heritage &bull; Adventure</p>
          <p className="text-xs text-zinc-400">(c) {new Date().getFullYear()} Timeless Landscapes, Crafted Journeys</p>
        </div>
      </footer>
    </div>
  );
}
