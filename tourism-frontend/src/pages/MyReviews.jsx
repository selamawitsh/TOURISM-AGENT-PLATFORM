import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import { 
  Star, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  MessageSquare,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  Filter,
  ChevronRight,
  Heart,
  Share2,
  MoreVertical,
  AlertCircle,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reviewAPI } from '../services/api';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { cn } from '@/lib/utils';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

const MyReviews = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
    setDeletingId(reviewId);
    try {
      await reviewAPI.deleteReview(reviewId);
      await loadMyReviews();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const stats = {
    total: reviews.length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    verified: reviews.filter(r => r.is_verified).length,
    thisMonth: reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      const now = new Date();
      return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Share Your Experience</h2>
            <p className="text-slate-600 mb-8">
              Sign in to write reviews and help other travelers discover amazing destinations!
            </p>
            <PrimaryButton asChild to="/login" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl">
              Sign In to Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-emerald-600"
            />
            <Star className="absolute inset-0 m-auto h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
            Loading your reviews
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="relative px-6 lg:px-10 py-8 lg:py-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full filter blur-3xl"></div>
              </div>
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span className="text-sm font-medium text-white/90">Your Voice Matters</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Reviews</h1>
                    <p className="text-lg text-white/80">
                      Manage your reviews and share your travel experiences
                    </p>
                  </div>
                  
                  <Link
                    to="/destinations"
                    className="group bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2 self-start"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Write a Review
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {reviews.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Reviews', value: stats.total, icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
              { label: 'Average Rating', value: stats.averageRating, icon: Star, color: 'from-emerald-500 to-teal-500', suffix: '★' },
              { label: 'Verified Reviews', value: stats.verified, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
              { label: 'This Month', value: stats.thisMonth, icon: Calendar, color: 'from-purple-500 to-pink-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                    stat.color
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Edit Form */}
        <AnimatePresence>
          {editingReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Edit Your Review</h2>
                  <button
                    onClick={() => setEditingReview(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <ReviewForm
                  destinationId={editingReview.destination_id}
                  destinationName={editingReview.destination_name}
                  initialData={editingReview}
                  onSubmit={handleUpdateReview}
                  onCancel={() => setEditingReview(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Filters */}
          {reviews.length > 0 && (
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-slate-400" />
                <div className="flex gap-2">
                  {['all', '5', '4', '3', '2', '1'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        filterRating === rating
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {rating === 'all' ? 'All' : (
                        <span className="flex items-center gap-1">
                          {rating} <Star className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="p-6">
            {filteredReviews.length === 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {reviews.length === 0 ? 'No reviews yet' : 'No matching reviews'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {reviews.length === 0 
                    ? "You haven't written any reviews yet. Share your experiences with other travelers!"
                    : 'Try adjusting your filters to see more reviews.'}
                </p>
                {reviews.length === 0 && (
                  <PrimaryButton asChild to="/destinations" className="px-6 py-3">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Write a Review
                    </span>
                  </PrimaryButton>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    variants={itemVariants}
                    layout
                    className="group bg-slate-50/50 rounded-2xl p-6 hover:shadow-lg transition-all border border-slate-100 hover:border-emerald-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Destination Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <Link 
                              to={`/destinations/${review.destination_name?.toLowerCase().replace(/\s+/g, '-')}`}
                              className="group/link"
                            >
                              <h3 className="text-lg font-bold text-slate-900 group-hover/link:text-emerald-600 transition">
                                {review.destination_name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                              <StarRating rating={review.rating} size="small" readonly />
                              <span className="text-sm text-slate-400">•</span>
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {review.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-semibold text-slate-800 mb-2">{review.title}</h4>
                        )}
                        
                        <p className="text-slate-600 leading-relaxed mb-4">
                          {review.comment}
                        </p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {review.images.slice(0, 3).map((image, i) => (
                              <img
                                key={i}
                                src={image}
                                alt="Review"
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <SecondaryButton 
                            onClick={() => setEditingReview(review)} 
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Edit className="w-4 h-4" />
                          </SecondaryButton>
                          <SecondaryButton 
                            onClick={() => setShowDeleteConfirm(review)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </SecondaryButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Delete Review</h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete your review for <span className="font-semibold text-slate-900">{showDeleteConfirm.destination_name}</span>? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <SecondaryButton 
                    onClick={() => setShowDeleteConfirm(null)} 
                    className="flex-1"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton 
                    onClick={() => handleDeleteReview(showDeleteConfirm.id)}
                    disabled={deletingId === showDeleteConfirm.id}
                    className="flex-1 bg-rose-500 hover:bg-rose-600"
                  >
                    {deletingId === showDeleteConfirm.id ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyReviews;