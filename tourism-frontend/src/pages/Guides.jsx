import React from 'react';
import { Container, PrimaryButton } from '../components/ui/designSystem';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck } from 'lucide-react';

export default function Guides() {
  const guides = [
    { name: 'Selam', bio: 'Cultural guide with 10+ years experience', lang: 'EN, AM' },
    { name: 'Daniel', bio: 'Wildlife & trekking specialist', lang: 'EN' },
    { name: 'Marta', bio: 'Historical routes and storytelling', lang: 'EN, FR' },
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-white to-[#f7efe2]">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Guides</Badge>
          <h1 className="text-4xl font-heading font-semibold mb-4 animate-fade-up">Local Guides</h1>
          <p className="text-slate-600 mb-8">Meet experienced local guides who will craft authentic and safe experiences for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((g, i) => (
            <div key={g.name} className="p-6 bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i*80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">{g.name[0]}</div>
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-sm text-slate-500">{g.lang}</p>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600">{g.bio}</p>
              <div className="mt-4">
                <PrimaryButton asChild to="/book/1" className="px-4 py-2 text-sm">Request Guide</PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
