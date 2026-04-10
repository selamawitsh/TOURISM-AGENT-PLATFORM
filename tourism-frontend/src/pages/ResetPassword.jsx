import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('No reset token provided');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await authAPI.resetPassword(token, password);
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">Reset Your Password</h2>
            <p className="mt-3 text-sm text-slate-600">
              Enter a new password to recover your account.
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
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="Enter new password"
              />
              <p className="text-xs text-slate-500 mt-2">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
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

export default ResetPassword;
