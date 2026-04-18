import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Mountain,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn } from '@/lib/utils';

const heroSignals = [
  {
    value: 'Culture-first',
    label: 'Journeys shaped around living traditions, sacred places, and local atmosphere.',
  },
  {
    value: 'Scenic pacing',
    label: 'Routes designed to feel spacious, cinematic, and easy to enjoy on the ground.',
  },
  {
    value: 'Locally inspired',
    label: 'Iconic highlights balanced with details that make the trip feel personal.',
  },
];

const featuredJourneys = [
  {
    ...heroSlides[1],
    eyebrow: 'Sacred heritage',
  },
  {
    ...heroSlides[0],
    eyebrow: 'Highland adventure',
  },
  {
    ...heroSlides[5],
    eyebrow: 'Living culture',
  },
];

const planningPillars = [
  {
    icon: Mountain,
    title: 'Epic natural contrast',
    description:
      'Move from alpine trails to volcanic plains without losing the calm rhythm of a thoughtfully planned trip.',
    accent: 'from-emerald-500/20 via-emerald-200/20 to-transparent',
    iconStyle: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Coffee,
    title: 'Culture with warmth',
    description:
      'Coffee ceremonies, sacred architecture, markets, and music give each stop a distinct sense of place.',
    accent: 'from-amber-400/25 via-amber-100/50 to-transparent',
    iconStyle: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Camera,
    title: 'Cinematic moments',
    description:
      'Golden light, carved stone, and dramatic horizons make the whole journey feel unforgettable on arrival.',
    accent: 'from-sky-500/20 via-sky-100/45 to-transparent',
    iconStyle: 'bg-sky-100 text-sky-700',
  },
];

const callToActionHighlights = [
  {
    icon: Compass,
    title: 'Save destinations that catch your eye',
  },
  {
    icon: ShieldCheck,
    title: 'Plan with more clarity and confidence',
  },
  {
    icon: Sparkles,
    title: 'Turn inspiration into a real itinerary',
  },
];

const Home = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'agent') navigate('/agent/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeSlideData = heroSlides[activeSlide];

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7efe2_55%,#fdf8f1_100%)] text-slate-900">
      <section className="relative isolate overflow-hidden bg-stone-950">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.label}
              className={cn(
                'absolute inset-0 transition-all duration-[1400ms] ease-out',
                index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={cn(
                  'h-full w-full object-cover transition-transform duration-[1400ms]',
                  index === activeSlide ? 'animate-pan-slow' : 'scale-110'
                )}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(252,209,22,0.16),transparent_26%),linear-gradient(135deg,rgba(8,16,12,0.84)_8%,rgba(10,21,19,0.62)_48%,rgba(9,23,18,0.88)_100%)]" />
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[#f0c15c]/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid items-end gap-10 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)] lg:gap-14 lg:py-16">
            <div className="max-w-3xl">
              <Badge className="animate-fade-up rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-white backdrop-blur-md">
                <Sparkles className="mr-2 h-4 w-4" />
                Crafted Journeys Across Ethiopia
              </Badge>

              <h1 className="animate-fade-up delay-100 mt-6 max-w-4xl text-5xl leading-[0.95] font-semibold text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
                Travel Ethiopia with depth, color, and wonder.
              </h1>

              <p className="animate-fade-up delay-200 mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
                Sacred stonework, wild highlands, coffee rituals, and golden-hour landscapes all meet in one beautifully
                layered destination. Right now, the spotlight is on{' '}
                <span className="font-semibold text-[#f2ca70]">{activeSlideData.label}</span>.
              </p>

              <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#f0c15c] px-8 py-6 text-base font-semibold text-[#183221] shadow-[0_18px_50px_rgba(240,193,92,0.3)] transition hover:bg-[#f6cf7f]"
                >
                  <Link to="/register">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/8 px-8 py-6 text-base text-white backdrop-blur-md transition hover:bg-white/14 hover:text-white"
                >
                  <Link to="/destinations">Explore Destinations</Link>
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
                    Featured Escape
                  </Badge>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white transition hover:bg-black/35"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-white/55">{activeSlideData.label}</p>
                  <CardTitle className="mt-3 text-3xl leading-tight text-white md:text-4xl">
                    {activeSlideData.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-sm leading-7 text-white/78 md:text-base">{activeSlideData.description}</p>

                <div className="flex flex-wrap gap-2">
                  {activeSlideData.chips.map((chip) => (
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
                    <span>Scene {String(activeSlide + 1).padStart(2, '0')}</span>
                    <span>{heroSlides.length} destinations</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous slide"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 transition hover:bg-white/14"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex flex-1 gap-2">
                      {heroSlides.map((slide, idx) => (
                        <button
                          key={slide.label}
                          type="button"
                          aria-label={`Go to ${slide.label}`}
                          onClick={() => goToSlide(idx)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            idx === activeSlide ? 'flex-1 bg-[#f0c15c]' : 'w-6 bg-white/30 hover:bg-white/55'
                          )}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={nextSlide}
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

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-[#ead8b6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#6b4d1d]">
                Signature Journeys
              </Badge>
              <h2 className="mt-5 text-4xl leading-tight text-[#173124] sm:text-5xl">
                Three beautiful ways to experience the country.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-[#5e5547] sm:text-lg">
              Some travelers come for spiritual heritage, some for dramatic mountain light, and some for color-filled city
              culture. The best itineraries make room for all three moods.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <article className="group relative min-h-[540px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_90px_rgba(68,47,18,0.18)]">
              <img
                src={featuredJourneys[0].image}
                alt={featuredJourneys[0].title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.06)_0%,rgba(14,18,14,0.35)_32%,rgba(13,18,15,0.92)_100%)]" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <Badge className="w-fit rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.26em] text-white">
                  {featuredJourneys[0].eyebrow}
                </Badge>
                <h3 className="mt-5 max-w-xl text-3xl leading-tight text-white sm:text-4xl">
                  {featuredJourneys[0].title}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-white/80">{featuredJourneys[0].description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {featuredJourneys[0].chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/14 bg-white/12 px-3 py-1.5 text-xs font-medium text-white/90"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <div className="grid gap-6">
              {featuredJourneys.slice(1).map((journey) => (
                <article
                  key={journey.label}
                  className="group relative min-h-[255px] overflow-hidden rounded-[2.2rem] shadow-[0_24px_80px_rgba(68,47,18,0.14)]"
                >
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,14,0.1)_0%,rgba(12,16,14,0.78)_100%)]" />

                  <div className="absolute inset-0 flex flex-col justify-end p-7">
                    <Badge className="w-fit rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.26em] text-white">
                      {journey.eyebrow}
                    </Badge>
                    <h3 className="mt-4 max-w-sm text-2xl leading-tight text-white">{journey.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/78">{journey.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-12 h-64 w-[min(90vw,960px)] -translate-x-1/2 rounded-full bg-[#f1d08a]/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="max-w-2xl">
              <Badge className="rounded-full bg-[#1f5c46]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1f5c46]">
                Why Choose Us
              </Badge>
              <h2 className="mt-5 text-4xl leading-tight text-[#173124] sm:text-5xl">
                Beautiful travel planning needs both emotion and structure.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#5e5547] sm:text-lg">
                We pair the visual drama of Ethiopia with calmer, more intentional trip design, so the homepage feels like
                the beginning of a story instead of a generic booking flow.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[1.8rem] border border-[#d9c8ac] bg-white/70 p-5 shadow-[0_18px_50px_rgba(102,73,28,0.08)] backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1f5c46]">Thoughtful Composition</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5547]">
                    The page now uses stronger contrast, richer spacing, and layered surfaces to make the brand feel more
                    polished at first glance.
                  </p>
                </div>

                <div className="rounded-[1.8rem] border border-[#d9c8ac] bg-white/70 p-5 shadow-[0_18px_50px_rgba(102,73,28,0.08)] backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9b4d1f]">Warmer Visual Language</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5547]">
                    Ivory, amber, clay, and green now work together more consistently, so the experience feels rooted in
                    the rest of your app instead of using generic travel-site styling.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {planningPillars.map(({ accent, description, icon: Icon, iconStyle, title }) => (
                <Card
                  key={title}
                  className="relative overflow-hidden rounded-[2rem] border border-[#d9c8ac] bg-white/80 shadow-[0_22px_70px_rgba(102,73,28,0.12)] backdrop-blur-sm"
                >
                  <div className={cn('absolute inset-x-0 top-0 h-28 bg-gradient-to-br', accent)} />
                  <CardContent className="relative flex h-full flex-col p-6">
                    <div className={cn('inline-flex h-14 w-14 items-center justify-center rounded-2xl', iconStyle)}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-2xl leading-tight text-[#173124]">{title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#5e5547]">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.8rem] bg-[#123726] px-6 py-10 text-white shadow-[0_30px_110px_rgba(18,55,38,0.36)] sm:px-10 lg:px-12 lg:py-14">
            <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#f0c15c]/18 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-300/12 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
              <div className="max-w-2xl">
                <Badge className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                  Ready When You Are
                </Badge>
                <h2 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
                  Make the first impression of your platform feel unforgettable.
                </h2>
                <p className="mt-6 text-base leading-8 text-white/76 sm:text-lg">
                  Register to save destinations, compare moods and regions, and start shaping a trip that feels immersive
                  from the very first click.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-[#f0c15c] px-8 py-6 text-base font-semibold text-[#183221] transition hover:bg-[#f6cf7f]"
                  >
                    <Link to="/register">
                      Create an Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/8 px-8 py-6 text-base text-white transition hover:bg-white/14 hover:text-white"
                  >
                    <Link to="/destinations">Browse Destinations</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.3em] text-white/55">What You Unlock</p>
                <div className="mt-5 space-y-4">
                  {callToActionHighlights.map(({ icon: Icon, title }) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 rounded-[1.3rem] border border-white/10 bg-black/10 p-4"
                    >
                      <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#f0c15c]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm leading-7 text-white/82">{title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
