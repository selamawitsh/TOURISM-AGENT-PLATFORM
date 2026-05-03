import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  MapPin,
  Mountain,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useReveal, useParallax } from '@/lib/uiEffects';
import { destinationAPI } from '../services/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn } from '@/lib/utils';

const heroSignals = [
  {
    value: 'Culture-first',
    label: 'Journeys shaped around living traditions and sacred places.',
  },
  {
    value: 'Scenic pacing',
    label: 'Routes designed to feel spacious and cinematic on the ground.',
  },
  {
    value: 'Locally inspired',
    label: 'Iconic highlights balanced with personal, local details.',
  },
];

const featuredJourneys = [
  { ...heroSlides[1], eyebrow: 'Sacred heritage' },
  { ...heroSlides[0], eyebrow: 'Highland adventure' },
  { ...heroSlides[5], eyebrow: 'Living culture' },
];

const planningPillars = [
  {
    icon: Mountain,
    title: 'Epic Contrast',
    description: 'Move from alpine trails to volcanic plains in a single, calm rhythm.',
    accent: 'from-emerald-500/10 to-transparent',
    iconStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    icon: Coffee,
    title: 'Deep Roots',
    description: 'Coffee ceremonies and sacred architecture define each stop.',
    accent: 'from-amber-400/15 to-transparent',
    iconStyle: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    icon: Camera,
    title: 'Cinematic',
    description: 'Golden light and dramatic horizons made for unforgettable memories.',
    accent: 'from-sky-500/10 to-transparent',
    iconStyle: 'bg-sky-50 text-sky-700 border-sky-100',
  },
];

const Home = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFeatured, setActiveFeatured] = useState(0);
  const parallaxRef = useRef(null);

  const handleAuthenticationRedirect = useCallback(() => {
    if (!loading && isAuthenticated) {
      const routes = {
        admin: '/admin/dashboard',
        agent: '/agent/dashboard',
        customer: '/customer/dashboard',
      };
      navigate(routes[userRole] || '/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  useEffect(() => {
    handleAuthenticationRedirect();
  }, [handleAuthenticationRedirect]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useParallax(parallaxRef, 0.12);
  useReveal();

  useEffect(() => {
    const els = document.querySelectorAll('.reveal-card');
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFAF7] via-white to-[#FCFAF7] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* HERO SECTION */}
      <section className="relative min-h-[65vh] lg:min-h-screen w-full overflow-hidden flex items-center" aria-label="hero">
        <div className="absolute inset-0 z-0 parallax-hero" ref={parallaxRef}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.label}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-in-out transform-gpu',
                index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-10 hidden md:block">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heroSignals.map((signal, idx) => (
                <div 
                  key={signal.value} 
                  className="text-white/90 backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="text-lg font-bold mb-2 text-[#f0c15c]">{signal.value}</div>
                  <p className="text-sm text-white/70">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 py-8 lg:py-40 text-center text-white">
            <div className="mx-auto max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles size={16} className="text-[#f0c15c]" />
              <span className="text-sm font-medium">Discover the Land of Origins</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight lg:text-6xl drop-shadow-2xl">
              Ethiopia Timeless landscapes,
              <br />
              <span className="bg-gradient-to-r from-[#f0c15c] to-amber-300 bg-clip-text text-transparent">
                crafted journeys
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              Curated routes that balance culture, comfort, and cinematic scenery.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <PrimaryButton asChild to="/destinations" className="bg-[#f0c15c] text-[#173124] px-6 py-3 sm:px-8 sm:py-4 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Explore Routes
                <ArrowRight size={18} className="ml-2" />
              </PrimaryButton>
              <PrimaryButton asChild to="/register" className="bg-white/90 backdrop-blur-sm text-[#0f2d20] px-4 py-2 sm:px-6 sm:py-3 font-semibold hover:bg-white transition-all duration-300">
                Get Started
              </PrimaryButton>
            </div>

            <div className="flex items-center justify-center gap-2 mt-12">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    idx === activeSlide ? "w-8 bg-[#f0c15c]" : "w-1.5 bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE JOURNEY GRID */}
      <section data-reveal className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">The Collection</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Signature <span className="text-emerald-800">Journeys</span>
              </h2>
            </div>
            <p className="max-w-md text-zinc-500 leading-relaxed text-lg">
              Curated experiences that balance spiritual heritage with the raw power of the Ethiopian landscape.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 relative h-[520px] overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-2xl group">
              <img
                src={featuredJourneys[activeFeatured].image}
                alt={featuredJourneys[activeFeatured].title}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out transform-gpu group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
              <div className="absolute left-8 top-8 flex items-center gap-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 px-4 py-2">
                  <Sparkles size={14} className="mr-2" />
                  {featuredJourneys[activeFeatured].eyebrow}
                </Badge>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
                <h3 className="text-4xl font-bold mb-4 drop-shadow-lg">{featuredJourneys[activeFeatured].title}</h3>
                <p className="max-w-xl text-base text-white/90 leading-relaxed mb-6 animate-slide-up">
                  {featuredJourneys[activeFeatured].label}
                </p>
                <div className="flex items-center gap-4">
                  <PrimaryButton asChild to={`/destinations`} className="rounded-full bg-white/95 text-emerald-900 px-6 py-3 font-bold hover:bg-white hover:scale-105 transition-all duration-300">
                    Explore routes
                    <ArrowRight size={16} className="ml-2" />
                  </PrimaryButton>
                  <SecondaryButton 
                    onClick={() => setActiveFeatured((v) => (v + 1) % featuredJourneys.length)} 
                    className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
                  >
                    Next Journey
                  </SecondaryButton>
                </div>
              </div>
              <button
                aria-label="Previous"
                onClick={() => setActiveFeatured((v) => (v - 1 + featuredJourneys.length) % featuredJourneys.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                aria-label="Next"
                onClick={() => setActiveFeatured((v) => (v + 1) % featuredJourneys.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {featuredJourneys.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeatured(idx)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === activeFeatured ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              {featuredJourneys.map((journey, i) => (
                <article
                  key={journey.label}
                  onMouseEnter={() => setActiveFeatured(i)}
                  onFocus={() => setActiveFeatured(i)}
                  className={cn(
                    "group relative flex cursor-pointer overflow-hidden rounded-[1.5rem] bg-zinc-100 transition-all duration-500 hover:scale-[1.02] shadow-lg hover:shadow-2xl",
                    activeFeatured === i && "ring-2 ring-[#f0c15c] ring-offset-2"
                  )}
                >
                  <img src={journey.image} alt={journey.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-zinc-950/30 to-transparent group-hover:from-zinc-950/70 transition-all duration-300" />
                  <div className="relative p-6 flex items-end h-40">
                    <div className="w-full">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0c15c] mb-2 block">
                        {journey.eyebrow}
                      </span>
                      <h4 className="text-xl font-bold text-white mb-2">{journey.title}</h4>
                      <p className="text-sm text-white/90 opacity-0 transform translate-y-3 transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0">
                        {journey.label}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS SECTION */}
      <section data-reveal className="bg-gradient-to-b from-white via-zinc-50/50 to-white py-24 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-800 border-none px-4 py-2 text-sm">
                <ShieldCheck size={14} className="mr-2" />
                Why Travel With Us
              </Badge>
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl leading-[1.1]">
                Travel planning built for <br /> 
                <span className="bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent italic">
                  intentional explorers.
                </span>
              </h2>
              <p className="mt-8 text-lg text-zinc-600 leading-relaxed">
                We pair visual drama with structured, thoughtful design. Your trip should feel like a story, not a logistics puzzle.
              </p>
              <div className="mt-12 space-y-4">
                {[
                  { title: 'Curated local insights', desc: 'Authentic experiences guided by community knowledge' },
                  { title: 'Spacious, scenic pacing', desc: 'Routes designed for immersion, not rushing' },
                  { title: 'Boutique accommodation focus', desc: 'Handpicked stays that reflect local character' }
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 group cursor-default">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 group-hover:bg-emerald-200 transition-colors">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-800">{item.title}</span>
                      <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {planningPillars.map((pillar, idx) => (
                <Card 
                  key={pillar.title} 
                  className="pillar-card group overflow-hidden border-none shadow-xl hover:shadow-2xl bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={cn(
                    "inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    pillar.iconStyle
                  )}>
                    <pillar.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-3">{pillar.title}</h3>
                  <p className="text-base text-zinc-600 leading-relaxed">{pillar.description}</p>
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full group-hover:w-20 transition-all duration-500" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* DESTINATIONS PREVIEW */}
      <section data-reveal aria-label="destination-preview" className="py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[3rem] bg-gradient-to-br from-[#fffaf2] via-white to-[#f7efe2] p-8 md:p-12 shadow-xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Compass size={20} className="text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Destinations</span>
                </div>
                <h2 className="text-4xl font-bold text-zinc-900">Explore our curated routes</h2>
                <p className="mt-2 text-zinc-500">Handpicked destinations for unforgettable experiences</p>
              </div>
              <Link 
                to="/destinations" 
                className="group flex items-center gap-2 text-sm font-semibold text-[#1f5c46] hover:text-emerald-800 transition-colors"
              >
                View full collection 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <DestinationPreview />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* ABOUT / CULTURES / TOURS / GUIDES SECTIONS --> in-page anchors for home */}
      <section id="about" className="py-16 bg-white/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-semibold mb-4">About Ethiopia Tours</h2>
            <p className="text-slate-600 mb-6">We connect travelers with authentic Ethiopian experiences — crafted by local guides and communities. Responsible travel that benefits local people and preserves cultural heritage.</p>
          </div>
        </div>
      </section>

      <section id="cultures" className="py-16 bg-gradient-to-b from-white to-[#fffaf2]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-semibold mb-4">Cultures of Ethiopia</h2>
            <p className="text-slate-600 mb-6">Explore the rich tapestry of Ethiopia’s cultures — music, cuisine, festivals, and living traditions that shape local life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Festivals & Ceremonies</h3>
              <p className="text-sm text-slate-600">Timket, Meskel and many regional celebrations — experience color, music and ritual.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Cuisine</h3>
              <p className="text-sm text-slate-600">From injera to wat, taste authentic regional dishes with local hosts.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Arts & Crafts</h3>
              <p className="text-sm text-slate-600">Traditional weaving, pottery and musical instruments crafted by local artisans.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="tours" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-semibold mb-4">Tours & Experiences</h2>
            <p className="text-slate-600 mb-6">Handcrafted tours across Ethiopia — cultural, adventure, wildlife, and historical itineraries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Cultural Tours</h3>
              <p className="text-sm text-slate-600">Meet communities, attend local ceremonies, and learn traditional crafts.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Adventure</h3>
              <p className="text-sm text-slate-600">Trekking, highland hikes, and nature excursions with local guides.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Historical Routes</h3>
              <p className="text-sm text-slate-600">Visit rock-hewn churches, castles, and ancient sites with expert narrations.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="guides" className="py-16 bg-gradient-to-b from-[#fffaf2] to-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-semibold mb-4">Local Guides</h2>
            <p className="text-slate-600 mb-6">Meet our experienced local guides who will lead you through memorable journeys.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Experienced Guides</h3>
              <p className="text-sm text-slate-600">Locals with deep knowledge of regions, cultures, and landscapes.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Safety</h3>
              <p className="text-sm text-slate-600">Guides are trained on guest safety and local best practices.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <h3 className="font-medium mb-2">Custom Experiences</h3>
              <p className="text-sm text-slate-600">Tell us your interests and we’ll pair you with the right guide.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-12 border-t border-zinc-200/60 text-center bg-gradient-to-t from-zinc-50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mountain size={20} className="text-emerald-700" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
              Ethiopia
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-2">
            Ethiopia &bull; Heritage &bull; Adventure
          </p>
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Timeless Landscapes, Crafted Journeys
          </p>
        </div>
      </footer>
    </div>
  );
};

const DestinationPreview = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const loadFeaturedDestinations = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s before fetching
        const res = await destinationAPI.getFeaturedDestinations(6); // FIXED: Now uses destinationAPI from api.js
        const data = res?.data?.data || res?.data || [];
        setItems(data);
      } catch (err) {
        console.error('Error fetching featured destinations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedDestinations();
  }, []); // Empty dependency array is fine since hasFetched.current guards it

  useEffect(() => {
    const els = document.querySelectorAll('.reveal-card');
    if (!els || els.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (loading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-zinc-200 rounded-2xl h-64 mb-4" />
            <div className="h-5 bg-zinc-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-zinc-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load destinations. Please try again later.</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No destinations available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 3).map((d, index) => (
        <Link
          key={d.id || index}
          to={`/destinations/${d.slug}`}
          className={`group block overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 eth-card reveal-card ${index % 2 === 0 ? 'from-left' : 'from-right'}`}
          style={{ transitionDelay: `${index * 120}ms` }}
        >
          <div className="relative h-64 overflow-hidden rounded-t-2xl">
            <img 
              src={d.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1200'} 
              alt={d.name} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {d.is_featured && (
              <div className="absolute left-4 top-4">
                <Badge className="bg-[#f0c15c] text-[#173124] border-none shadow-lg">
                  <TrendingUp size={12} className="mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-1.5 text-white/90 text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MapPin size={14} />
                <span>{[d.city, d.country].filter(Boolean).join(', ') || 'Ethiopia'}</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
              <PrimaryButton className="bg-white text-emerald-900 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl hover:scale-105">
                Explore Destination
                <ArrowRight size={16} className="ml-2" />
              </PrimaryButton>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-[#173124] group-hover:text-emerald-700 transition-colors line-clamp-1">
                {d.name}
              </h3>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-semibold">{d.rating || '4.9'}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-[#6a5f52] flex items-center gap-2 line-clamp-1">
              <MapPin size={14} className="text-emerald-600" />
              {[d.city, d.region, d.country].filter(Boolean).join(', ') || 'Ethiopia'}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                {d.discount_price > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#173124]">${d.discount_price}</span>
                    <span className="text-sm text-zinc-400 line-through">${d.price_per_person}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#173124]">${d.price_per_person || 0}</div>
                )}
                <span className="text-xs text-zinc-500">per person</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-500 text-sm">
                <Users size={14} />
                <span>{d.duration_days || '5-7'}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};


export default Home;