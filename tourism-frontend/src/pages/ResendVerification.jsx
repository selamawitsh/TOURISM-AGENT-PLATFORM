import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResendVerification = () => {
  const { resendVerification } = useAuth();
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
      await resendVerification(email);
      setMessage('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">Resend Verification Email</h2>
            <p className="mt-3 text-sm text-slate-600">
              Enter your email and we’ll send a new verification link to your inbox.
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
              {loading ? 'Sending…' : 'Send Verification Email'}
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

export default ResendVerification;
