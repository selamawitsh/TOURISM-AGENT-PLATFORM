
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Coffee,
  Compass,
  Landmark,
  Mountain,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn } from '@/lib/utils';

const Home = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const routeStories = [
    {
      icon: Mountain,
      title: 'Highland escapes',
      description: 'For travelers chasing altitude, crisp mornings, and cliffside views with a calmer itinerary rhythm.',
      tone: 'from-emerald-100 to-white',
    },
    {
      icon: Landmark,
      title: 'Sacred and historic routes',
      description: 'Layer heritage landmarks, pilgrimage sites, and craft traditions into journeys with more depth.',
      tone: 'from-amber-100 to-white',
    },
    {
      icon: Coffee,
      title: 'City and coffee culture',
      description: 'Mix modern Addis energy, food, markets, and slow coffee moments without losing trip clarity.',
      tone: 'from-orange-100 to-white',
    },
  ];
  const platformHighlights = [
    {
      icon: Compass,
      title: 'Designed for real journeys',
      description: 'Itineraries, bookings, profiles, and support feel connected instead of scattered.',
    },
    {
      icon: ShieldCheck,
      title: 'Made for trust',
      description: 'Customers, agents, and administrators all work inside the same warm, readable system.',
    },
    {
      icon: Sparkles,
      title: 'Styled with intention',
      description: 'Textile-like patterns, grounded color, and subtle motion give the product a distinct identity.',
    },
  ];

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'agent') navigate('/agent/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="woven-surface relative overflow-hidden rounded-[2.5rem] border border-white/55 bg-[linear-gradient(140deg,rgba(19,57,45,0.98),rgba(38,76,58,0.95)_48%,rgba(141,74,31,0.93))] px-6 py-8 text-white shadow-[0_38px_110px_-52px_rgba(16,32,24,0.92)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,192,102,0.3),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.16),transparent_30%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-7">
            <Badge variant="gold" className="border-white/15 bg-white/10 text-amber-100 animate-fade-up">
              Rooted in Ethiopian journeys
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl leading-[1.03] tracking-tight text-white animate-fade-up sm:text-6xl">
                Travel planning with more atmosphere, less noise.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78 animate-fade-up delay-100">
                Built for routes that feel layered and memorable, from mountain air and old stone pathways to city nights and coffee ritual. The platform now feels warmer, calmer, and more distinctly Ethiopian.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 animate-fade-up delay-200">
              <Button asChild size="lg" className="shadow-xl shadow-black/20">
                <Link to="/register">
                  Start exploring
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/16 hover:text-white">
                <Link to="/login">Login</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 animate-fade-up delay-300">
              {[
                { value: 'One place', label: 'Bookings, profiles, and roles' },
                { value: 'Story-first', label: 'Destinations with more character' },
                { value: 'Mobile ready', label: 'Comfortable on every screen' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[1.7rem] border border-white/12 bg-white/[0.08] px-4 py-4 backdrop-blur-sm">
                  <p className="font-heading text-2xl text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative min-h-[440px] overflow-hidden rounded-[2.1rem] border border-white/15 bg-black/15 shadow-2xl">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.label}
                  className={cn(
                    'absolute inset-0 transition-all duration-700 ease-out',
                    index === activeSlide ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
                  )}
                >
                  <img
                    alt={slide.title}
                    className={cn('h-full w-full object-cover', index === activeSlide && 'animate-pan-slow')}
                    src={slide.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                </div>
              ))}

              <div className="absolute inset-x-0 bottom-0 z-10 px-5 py-5 sm:px-6 sm:py-6">
                <Badge variant="gold" className="border-transparent bg-amber-100/18 text-amber-100">
                  {heroSlides[activeSlide].label}
                </Badge>
                <h2 className="mt-4 max-w-xl text-4xl leading-tight text-white">
                  {heroSlides[activeSlide].title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/78 sm:text-base">
                  {heroSlides[activeSlide].description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {heroSlides[activeSlide].chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/14 bg-white/12 px-3 py-1.5 text-xs font-medium tracking-[0.18em] text-white/82 uppercase"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={cn(
                    'rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300',
                    index === activeSlide
                      ? 'border-primary/10 bg-white shadow-[0_22px_50px_-38px_rgba(17,22,16,0.8)]'
                      : 'border-white/55 bg-white/65 hover:bg-white/85',
                  )}
                >
                  <p className="section-kicker text-secondary">{slide.label}</p>
                  <p className="mt-2 font-heading text-xl leading-tight text-slate-950">{slide.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{slide.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <Card className="bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,236,217,0.9))]">
          <CardHeader>
            <Badge variant="accent" className="w-fit">
              Built around travel moods
            </Badge>
            <CardTitle>The interface now feels closer to the journeys it serves</CardTitle>
            <CardDescription>
              Instead of generic travel blocks, each section is tuned around how Ethiopian trips are often experienced: scenic, cultural, social, and grounded in place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routeStories.map((story) => {
              const Icon = story.icon;

              return (
                <div
                  key={story.title}
                  className={`rounded-[1.6rem] border border-border/70 bg-gradient-to-br ${story.tone} p-5 soft-outline`}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-white text-primary shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl text-slate-950">{story.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{story.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {platformHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="group overflow-hidden bg-white/92 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-45px_rgba(17,22,16,0.9)]">
                <CardHeader className="pb-4">
                  <span className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-muted text-primary shadow-sm transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-[1.7rem]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}

          <Card className="woven-surface overflow-hidden bg-[linear-gradient(145deg,rgba(31,92,70,0.98),rgba(53,102,76,0.92)_55%,rgba(166,75,34,0.95))] text-white md:col-span-2 xl:col-span-1">
            <CardHeader>
              <Badge variant="gold" className="w-fit border-white/10 bg-white/10 text-amber-100">
                For every role
              </Badge>
              <CardTitle className="text-white">Customer, agent, and admin views now sit inside one clearer visual language.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-4 text-sm text-white/78">
                Travelers get a softer first impression and easier entry into bookings.
              </div>
              <div className="rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-4 text-sm text-white/78">
                Agents and admins keep the same structure, but with a more memorable product identity.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,251,244,0.95),rgba(246,236,222,0.95))]">
          <CardHeader className="gap-4">
            <Badge variant="outline" className="w-fit bg-white/75">
              Design direction
            </Badge>
            <CardTitle>Beauty that still feels usable</CardTitle>
            <CardDescription>
              The update leans into richer material, motion, and typography, but keeps the product readable for daily use. That balance is what keeps it from feeling generic or overly artificial.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              'Layered backgrounds that feel atmospheric without making forms harder to use.',
              'Subtle movement on imagery and decorative stripes that gives the page life without distraction.',
              'A more grounded palette shaped around green, gold, clay, and parchment instead of default SaaS blue.',
            ].map((point) => (
              <div key={point} className="rounded-[1.5rem] border border-border/70 bg-white/78 p-5 text-sm leading-7 text-slate-600 soft-outline">
                {point}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="woven-surface overflow-hidden bg-[linear-gradient(145deg,rgba(19,57,45,0.98),rgba(43,87,68,0.92)_54%,rgba(166,75,34,0.94))] text-white">
          <CardHeader>
            <Badge variant="gold" className="w-fit border-white/10 bg-white/10 text-amber-100">
              Ready to enter
            </Badge>
            <CardTitle className="text-white">Start with a smoother first step into the platform</CardTitle>
            <CardDescription className="text-white/72">
              Create an account or log in to move from inspiration into planning, profiles, and the next version of the dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild size="lg" className="w-full shadow-xl shadow-black/20">
              <Link to="/register">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white">
              <Link to="/login">Login instead</Link>
            </Button>
            <div className="rounded-[1.5rem] border border-white/12 bg-white/8 px-4 py-4 text-sm leading-7 text-white/78">
              The visual system now carries through the shell, forms, and profile screen so the product feels intentionally designed end to end.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;
