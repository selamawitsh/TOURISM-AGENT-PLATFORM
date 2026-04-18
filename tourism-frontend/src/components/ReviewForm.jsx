import React, { useState } from 'react';
import { X } from 'lucide-react';

import StarRating from './StarRating';

const ReviewForm = ({ destinationId, destinationName, onSubmit, onCancel, initialData = null }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({
        destination_id: destinationId,
        rating,
        title,
        comment,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-[#d9c8ac] bg-white/86 p-6 shadow-[0_16px_40px_rgba(99,72,31,0.08)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl text-[#173124]">
            {initialData ? 'Edit Your Review' : `Write a Review for ${destinationName}`}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#62584b]">Share the atmosphere, pacing, and details future travelers should know.</p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c8ac] bg-[#fff8ee] text-[#62584b] transition hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#4d473f]">Your Rating *</label>
          <StarRating rating={rating} onRatingChange={setRating} size="large" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4d473f]">Review Title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Summarize your experience"
            className="w-full rounded-[1.1rem] border border-[#d9c8ac] bg-white px-4 py-3 text-[#173124] outline-none transition focus:border-[#1f5c46] focus:ring-2 focus:ring-[#1f5c46]/15"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4d473f]">Your Review *</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            placeholder="Share your experience with this destination..."
            className="w-full rounded-[1.1rem] border border-[#d9c8ac] bg-white px-4 py-3 text-[#173124] outline-none transition focus:border-[#1f5c46] focus:ring-2 focus:ring-[#1f5c46]/15"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#d9c8ac] bg-white px-5 py-2.5 text-sm font-medium text-[#62584b] transition hover:bg-[#fff8ee]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#1f5c46] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#174635] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
