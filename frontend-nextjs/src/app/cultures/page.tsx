import { Coffee, Music, Palette } from 'lucide-react';

export default function CulturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-emerald-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Cultures of Ethiopia</h1>
        <p className="text-lg text-white/80">Rich traditions, music, cuisine, and living heritage</p>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl border p-6 text-center">
            <Coffee className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Cuisine</h3>
            <p className="text-gray-600 text-sm">From injera to wat, taste authentic regional dishes with local hosts.</p>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <Music className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Festivals</h3>
            <p className="text-gray-600 text-sm">Timket, Meskel and regional celebrations with color, music and ritual.</p>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <Palette className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Arts & Crafts</h3>
            <p className="text-gray-600 text-sm">Traditional weaving, pottery and instruments crafted by local artisans.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
