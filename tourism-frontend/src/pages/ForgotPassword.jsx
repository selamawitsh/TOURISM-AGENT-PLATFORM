import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setMessage('If your email is registered, you will receive a password reset link shortly.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM9 12.75h6m-6 3h6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-3.75" />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">Forgot Password?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Enter your email address and we'll send you a secure reset link.
            </p>
          </div>

          {message && (
            <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700 shadow-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
