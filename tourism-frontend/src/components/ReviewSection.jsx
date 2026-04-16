import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reviewAPI } from '../services/api';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

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
      
      // Check if user has already reviewed
      if (isAuthenticated && user) {
        const userReviewData = response.data.reviews?.find(r => r.user_id === user.id);
        setUserReview(userReviewData);
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Traveler Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-lg font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">· {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
        
        {isAuthenticated && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            destinationId={destinationId}
            destinationName={destinationName}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <div className="mb-6">
          <ReviewForm
            destinationId={destinationId}
            destinationName={destinationName}
            initialData={editingReview}
            onSubmit={handleUpdateReview}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {getInitials(review.user_name || 'Traveler')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{review.user_name || 'Traveler'}</span>
                      {review.is_verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="small" readonly />
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mt-2">{review.title}</h4>
                    )}
                    <p className="text-gray-600 mt-1">{review.comment}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful_count || 0})</span>
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {(user?.id === review.user_id || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingReview(review)}
                      className="text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;