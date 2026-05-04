'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, MapPin } from 'lucide-react';

const REVIEW_URL = 'https://review-service-rl4v.onrender.com/api/v1';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    fetch(`${REVIEW_URL}/reviews/me`, { headers: { Authorization: 'Bearer ' + token } })
      .then(async res => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setReviews(Array.isArray(data?.data) ? data.data : []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"><ArrowLeft className="h-5 w-5" /> Back to Dashboard</Link>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 lg:px-10 py-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="text-sm">Your Voice Matters</span></div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Reviews</h1>
            <p className="text-white/80">{reviews.length} reviews · Avg: {avgRating} <Star className="w-4 h-4 inline fill-amber-400 text-amber-400" /></p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><MessageSquare className="h-10 w-10 text-emerald-400" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-6">Share your experiences with other travelers!</p>
            <Link href="/destinations" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600">Browse Destinations</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {r.destination_name && <p className="text-sm text-gray-500 flex items-center gap-1 mb-1"><MapPin className="h-3.5 w-3.5" />{r.destination_name}</p>}
                    {r.title && <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>}
                  </div>
                  <div className="flex items-center gap-0.5">{Array.from({length:5}).map((_,i)=>(<Star key={i} className={`h-5 w-5 ${i<r.rating?'text-amber-400 fill-amber-400':'text-gray-200'}`} />))}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  {r.is_verified && <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Verified</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
