'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

const REVIEW_URL = 'https://review-service-rl4v.onrender.com/api/v1';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    fetch(`${REVIEW_URL}/reviews/me`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setReviews(Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="h-5 w-5" /> Back to Dashboard</Link>
        <div className="flex items-center gap-3 mb-6"><Star className="h-8 w-8 text-amber-500 fill-amber-500" /><h1 className="text-3xl font-bold text-gray-900">My Reviews</h1></div>
        {loading ? <p className="text-gray-500">Loading...</p> : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border"><Star className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No reviews yet</p></div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl p-5 border">
                <div className="flex items-center gap-2 mb-2">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />))}</div>
                <p className="text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
