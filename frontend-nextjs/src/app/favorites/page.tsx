'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, MapPin, Star, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const FAV_URL = 'https://favorites-service-eq29.onrender.com/api/v1';
const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${FAV_URL}/favorites`, { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      const favs = data?.data || data || [];
      const favList = Array.isArray(favs) ? favs : [];
      const enriched = await Promise.all(favList.map(async (fav: any) => {
        try {
          const destRes = await fetch(`${DEST_URL}/destinations/${fav.destination_id}`);
          const destData = await destRes.json();
          return { ...fav, destination: destData?.data || destData };
        } catch { return fav; }
      }));
      setFavorites(enriched);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (destinationId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setRemovingId(destinationId);
    try {
      await fetch(`${FAV_URL}/favorites/${destinationId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      setFavorites(prev => prev.filter(f => f.destination_id !== destinationId));
    } catch {} finally { setRemovingId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 lg:px-10 py-8 lg:py-10 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm font-medium text-white/90">Your Saved Places</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Favorites</h1>
            <p className="text-lg text-white/80">{favorites.length} {favorites.length === 1 ? 'destination' : 'destinations'} saved for later</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved destinations</h3>
            <p className="text-gray-500 mb-6">Save destinations you love for quick access later.</p>
            <Link href="/destinations" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors">
              Browse Destinations
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav: any) => {
              const dest = fav.destination || {};
              const price = dest.discount_price || dest.price_per_person || 0;
              const image = dest.main_image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600';
              const slug = dest.slug || fav.destination_id;
              const location = [dest.city, dest.country].filter(Boolean).join(', ') || 'Ethiopia';

              return (
                <div key={fav.id} className="group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all">
                  <Link href={`/destinations/${slug}`} className="block relative h-48 overflow-hidden">
                    <img src={image} alt={dest.name || 'Destination'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemove(fav.destination_id); }}
                      disabled={removingId === fav.destination_id}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {dest.rating || '4.8'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(price)}</p>
                    </div>
                  </Link>
                  <Link href={`/destinations/${slug}`} className="block p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {dest.name || fav.destination_name || 'Destination'}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{dest.rating || '4.8'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="line-clamp-1">{location}</span>
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xl font-bold text-emerald-700">{formatCurrency(price)}</span>
                        <span className="text-xs text-gray-400 ml-1">per person</span>
                      </div>
                      <span className="text-xs text-gray-400">{dest.duration || 5} days</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
