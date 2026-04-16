import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Edit, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reviewAPI } from '../services/api';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';

const MyReviews = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyReviews();
    }
  }, [isAuthenticated]);

  const loadMyReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getMyReviews();
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (reviewData) => {
    await reviewAPI.updateReview(editingReview.id, reviewData);
    setEditingReview(null);
    await loadMyReviews();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await reviewAPI.deleteReview(reviewId);
    await loadMyReviews();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to see your reviews</h2>
        <p className="text-gray-600 mb-6">Share your experiences and help other travelers!</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">Manage your reviews and ratings</p>
      </div>

      {editingReview && (
        <div className="mb-6">
          <ReviewForm
            destinationId={editingReview.destination_id}
            destinationName={editingReview.destination_name}
            initialData={editingReview}
            onSubmit={handleUpdateReview}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
          <p className="text-gray-600 mb-6">You haven't written any reviews yet.</p>
          <Link to="/destinations" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/destinations/${review.destination_name?.toLowerCase().replace(/\s+/g, '-')}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                      {review.destination_name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="small" readonly />
                    <span className="text-sm text-gray-500">· {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-800 mt-3">{review.title}</h4>
                  )}
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                  {review.is_verified && (
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      ✓ Verified Booking
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;