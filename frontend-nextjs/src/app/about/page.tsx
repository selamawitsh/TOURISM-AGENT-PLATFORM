import { MapPin, Users, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">About Ethiopia Tours</h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">Connecting travelers with authentic Ethiopian experiences since 2024</p>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center p-6"><MapPin className="h-10 w-10 text-emerald-600 mx-auto mb-3" /><h3 className="font-bold text-lg mb-2">Local Expertise</h3><p className="text-gray-600 text-sm">Guided by locals who know every hidden gem and cultural treasure.</p></div>
          <div className="text-center p-6"><Users className="h-10 w-10 text-emerald-600 mx-auto mb-3" /><h3 className="font-bold text-lg mb-2">Community First</h3><p className="text-gray-600 text-sm">Your journey supports local communities and preserves heritage.</p></div>
          <div className="text-center p-6"><Shield className="h-10 w-10 text-emerald-600 mx-auto mb-3" /><h3 className="font-bold text-lg mb-2">Safe Travel</h3><p className="text-gray-600 text-sm">Professional guides and carefully planned routes for worry-free adventure.</p></div>
        </div>
      </section>
    </div>
  );
}
