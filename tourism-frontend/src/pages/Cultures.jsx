import React from 'react';
import { Container, PrimaryButton } from '../components/ui/designSystem';
import { Badge } from '@/components/ui/badge';
import { Camera, Sparkles } from 'lucide-react';

export default function Cultures() {
  return (
    <div className="py-16 bg-white">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Culture</Badge>
          <h1 className="text-4xl font-heading font-semibold mb-4 animate-fade-up">Cultures of Ethiopia</h1>
          <p className="text-slate-600 mb-8">Explore the rich tapestry of Ethiopia’s cultures — music, cuisine, festivals, and living traditions that shape daily life.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{
            title: 'Festivals & Ceremonies',
            desc: 'Timket, Meskel and regional celebrations — color and ritual.'
          },{
            title: 'Cuisine',
            desc: 'Injera, wat and coffee ceremonies — taste regional flavors.'
          },{
            title: 'Arts & Crafts',
            desc: 'Weaving, pottery and music — crafted by local artisans.'
          }].map((c, i) => (
            <article key={c.title} className="p-6 bg-gradient-to-br from-white to-[#fffaf2] rounded-2xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-up" style={{ animationDelay: `${i*80}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <Camera className="w-6 h-6 text-emerald-600" />
                <h3 className="font-semibold">{c.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{c.desc}</p>
              <div className="mt-4">
                <PrimaryButton asChild to="/destinations" className="text-sm px-4 py-2">Explore related routes</PrimaryButton>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
