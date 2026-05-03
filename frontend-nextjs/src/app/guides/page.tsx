import { Users, Award, MapPin } from 'lucide-react';

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Local Guides</h1>
        <p className="text-lg text-white/80">Meet our experienced local guides</p>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {['Historical Experts', 'Adventure Leaders', 'Cultural Ambassadors'].map((title) => (
            <div key={title} className="bg-white rounded-xl border p-6 text-center">
              <Users className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">Experienced guides with deep knowledge of Ethiopian regions and cultures.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
