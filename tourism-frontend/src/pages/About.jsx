import React from 'react';
import { Container, PrimaryButton } from '../components/ui/designSystem';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, MapPin } from 'lucide-react';

export default function About() {
  return (
    <div className="py-16 bg-gradient-to-b from-white to-[#fffaf2]">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 justify-center">
            <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">About</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-up">About Ethiopia Tours</h1>
          <p className="text-slate-600 mb-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
            We connect travelers with authentic Ethiopian experiences — crafted by local guides and communities. We focus on responsible travel, local partnerships, and meaningful cultural exchange.
          </p>
          <div className="flex items-center justify-center gap-4">
            <PrimaryButton asChild to="/destinations" className="px-6 py-3">Explore Destinations</PrimaryButton>
            <PrimaryButton asChild to="/guides" className="bg-white/90 text-[#0f2d20] px-5 py-2">Meet Guides</PrimaryButton>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-up">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h3 className="font-semibold">Curated Experiences</h3>
            </div>
            <p className="text-sm text-slate-600">We design routes that balance cinematic landscapes with deep cultural encounters.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold">Community First</h3>
            </div>
            <p className="text-sm text-slate-600">We partner closely with guides and local communities to ensure responsible tourism benefits everyone.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-sky-600" />
              <h3 className="font-semibold">Local Knowledge</h3>
            </div>
            <p className="text-sm text-slate-600">Our itineraries are informed by local expertise and deep regional knowledge.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
