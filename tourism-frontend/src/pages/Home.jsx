import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Play, Pause, Mountain, Coffee, Camera } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { heroSlides } from '@/lib/ethiopiaVisuals';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section - Full Screen Carousel */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.label}
              className={cn(
                'absolute inset-0 transition-all duration-1000 ease-out',
                index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              )}
            >
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-6 bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-2 text-sm">
              <Compass className="w-4 h-4 mr-2" />
              Discover Ethiopia
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              {heroSlides[activeSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              {heroSlides[activeSlide].description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl">
                <Link to="/register">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg rounded-2xl">
                <Link to="/destinations">Explore Destinations</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {heroSlides[activeSlide].chips.map((chip) => (
                <span key={chip} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                idx === activeSlide ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 group"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-8 right-8 z-20 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition"
        >
          {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700">Why Choose Us</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Experience Ethiopia Like Never Before
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From ancient history to breathtaking landscapes, discover the magic of Ethiopia with our curated travel experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
              <Mountain className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Breathtaking Landscapes</h3>
            <p className="text-gray-600 leading-relaxed">
              From the Simien Mountains to the Danakil Depression, explore Ethiopia's diverse and stunning natural wonders.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors duration-300">
              <Coffee className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Rich Cultural Heritage</h3>
            <p className="text-gray-600 leading-relaxed">
              Experience ancient traditions, vibrant festivals, and the warm hospitality of the Ethiopian people.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
              <Camera className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Unforgettable Memories</h3>
            <p className="text-gray-600 leading-relaxed">
              Capture stunning photos and create lasting memories with our expertly curated tour packages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore Ethiopia?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy travelers who have discovered the magic of Ethiopia with us.
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl">
            <Link to="/register">
              Start Your Adventure
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;