import { Compass, Mountain, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ToursPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Tours & Experiences</h1>
        <p className="text-lg text-white/80">Handcrafted tours across Ethiopia</p>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl border p-6 text-center">
            <Mountain className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Adventure</h3>
            <p className="text-gray-600 text-sm mb-4">Trekking, highland hikes, and nature excursions.</p>
            <Link href="/destinations?difficulty=hard" className="text-emerald-700 font-medium text-sm hover:underline">View adventures</Link>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <Compass className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Cultural</h3>
            <p className="text-gray-600 text-sm mb-4">Meet communities and learn traditional crafts.</p>
            <Link href="/destinations?difficulty=moderate" className="text-emerald-700 font-medium text-sm hover:underline">View cultural tours</Link>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <Camera className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Historical</h3>
            <p className="text-gray-600 text-sm mb-4">Ancient sites and rock-hewn churches.</p>
            <Link href="/destinations?difficulty=easy" className="text-emerald-700 font-medium text-sm hover:underline">View historical tours</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
