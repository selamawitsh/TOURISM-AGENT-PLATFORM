import React, { useEffect, useState } from 'react';
import { Edit, ThumbsUp, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { reviewAPI } from '../services/api';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

const ReviewSection = ({ destinationId, destinationName }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [destinationId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getDestinationReviews(destinationId);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.average_rating || 0);
      setTotalReviews(response.data.total_reviews || 0);

      if (isAuthenticated && user) {
        const userReviewData = response.data.reviews?.find((review) => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    await reviewAPI.createReview(reviewData);
    setShowReviewForm(false);
    await loadReviews();
  };

  const handleUpdateReview = async (reviewData) => {
    await reviewAPI.updateReview(editingReview.id, reviewData);
    setEditingReview(null);
    await loadReviews();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await reviewAPI.deleteReview(reviewId);
    await loadReviews();
  };

  const handleMarkHelpful = async (reviewId) => {
    await reviewAPI.markHelpful(reviewId);
    await loadReviews();
  };

  const getInitials = (name) =>
    (name || 'Traveler')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="flex justify-center rounded-[2.4rem] border border-[#d9c8ac] bg-white/80 py-12 shadow-[0_18px_50px_rgba(99,72,31,0.08)]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#d9c8ac] border-t-[#1f5c46]" />
      </div>
    );
  }

  return (
    <div className="rounded-[2.4rem] border border-[#d9c8ac] bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(247,236,217,0.9))] p-6 shadow-[0_26px_80px_rgba(99,72,31,0.12)] sm:p-7">
      <div className="flex flex-col gap-5 border-b border-[#e7d8be] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge className="bg-[#ead8b6] text-[#6b4d1d]">Traveler reviews</Badge>
          <h2 className="mt-4 text-3xl text-[#173124]">What guests say about this route</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[#62584b]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
              <span className="text-2xl font-semibold text-[#173124]">{averageRating.toFixed(1)}</span>
              <StarRating rating={Math.round(averageRating)} size="small" readonly />
            </div>
            <span className="text-sm">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
            {userReview ? <span className="text-sm text-[#1f5c46]">You already reviewed this destination.</span> : null}
          </div>
        </div>

        {isAuthenticated && !userReview && !showReviewForm ? (
          <Button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="rounded-full bg-[#1f5c46] px-6 text-white hover:bg-[#174635]"
          >
            Write a Review
          </Button>
        ) : null}
      </div>

      {showReviewForm ? (
        <div className="mt-6">
          <ReviewForm
            destinationId={destinationId}
            destinationName={destinationName}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      ) : null}

      {editingReview ? (
        <div className="mt-6">
          <ReviewForm
            destinationId={destinationId}
            destinationName={destinationName}
            initialData={editingReview}
            onSubmit={handleUpdateReview}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-[1.8rem] border border-[#e7d8be] bg-white/78 px-6 py-10 text-center">
          <p className="text-lg text-[#173124]">No reviews yet.</p>
          <p className="mt-2 text-sm leading-7 text-[#62584b]">Be the first traveler to share what this experience felt like.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[1.8rem] border border-[#e2d2b6] bg-white/84 p-5 shadow-[0_14px_40px_rgba(99,72,31,0.07)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ead8b6] font-semibold text-[#6b4d1d]">
                    {getInitials(review.user_name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#173124]">{review.user_name || 'Traveler'}</span>
                      {review.is_verified ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Verified booking
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <StarRating rating={review.rating} size="small" readonly />
                      <span className="text-xs uppercase tracking-[0.2em] text-[#8f5b28]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {review.title ? <h4 className="mt-3 text-lg font-semibold text-[#173124]">{review.title}</h4> : null}
                    <p className="mt-2 text-sm leading-7 text-[#62584b]">{review.comment}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleMarkHelpful(review.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d9c8ac] bg-[#fff8ee] px-4 py-2 text-sm text-[#62584b] transition hover:bg-white"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpful_count || 0})
                      </button>
                    </div>
                  </div>
                </div>

                {user?.id === review.user_id || user?.role === 'admin' ? (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingReview(review)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c8ac] bg-white text-[#62584b] transition hover:text-[#1f5c46]"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c8ac] bg-white text-[#62584b] transition hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
