import React from 'react';
import { Container, PrimaryButton } from '../components/ui/designSystem';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mountain } from 'lucide-react';

export default function Tours() {
  const tours = [
    { title: 'Highland Adventure', desc: 'Guided hikes across the Simien and Bale ranges', tag: 'Adventure' },
    { title: 'Cultural Immersion', desc: 'Village stays and ceremonies with local hosts', tag: 'Culture' },
    { title: 'Ancient Heritage', desc: 'Rock-hewn churches and historical routes', tag: 'History' },
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-white to-[#fffaf2]">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Tours</Badge>
          <h1 className="text-4xl font-heading font-semibold mb-4 animate-fade-up">Tours & Experiences</h1>
          <p className="text-slate-600 mb-8">Handcrafted tours across Ethiopia — choose from cultural, adventure, wildlife, and historical itineraries.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tours.map((t, i) => (
            <div key={t.title} className="p-6 bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i*80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t.title}</h3>
                <span className="text-xs text-zinc-500">{t.tag}</span>
              </div>
              <p className="text-sm text-slate-600">{t.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Starting from Addis</span>
                </div>
                <PrimaryButton asChild to="/destinations" className="px-4 py-2 text-sm">View Routes</PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
