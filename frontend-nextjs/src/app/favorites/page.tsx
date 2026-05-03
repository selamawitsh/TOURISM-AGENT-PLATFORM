'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, MapPin } from 'lucide-react';

const FAV_URL = 'https://favorites-service-eq29.onrender.com/api/v1';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    fetch(`${FAV_URL}/favorites`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setFavorites(Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="h-5 w-5" /> Back to Dashboard</Link>
        <div className="flex items-center gap-3 mb-6"><Heart className="h-8 w-8 text-red-500 fill-red-500" /><h1 className="text-3xl font-bold text-gray-900">My Favorites</h1></div>
        {loading ? <p className="text-gray-500">Loading...</p> : favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border"><Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No favorites yet</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav: any) => (
              <Link key={fav.id} href={`/destinations/${fav.destination?.slug || fav.slug}`} className="bg-white rounded-xl p-4 border hover:shadow-md">
                <h3 className="font-semibold text-gray-900">{fav.destination?.name || fav.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{fav.destination?.city || fav.city}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
