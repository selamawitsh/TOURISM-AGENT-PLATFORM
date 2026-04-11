
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import { authAPI } from '../services/api';
import AuthShell from '../components/AuthShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authVisuals } from '@/lib/ethiopiaVisuals';

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
    if (tokenParam) setToken(tokenParam);
    else setError('No reset token provided');
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
    <AuthShell
      eyebrow="Choose a new password"
      title="Set a fresh password and keep going"
      description="This step stays simple and reassuring, with the updated styling carrying through recovery as well."
      visuals={authVisuals.slice(0, 2)}
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-white/70">
            Reset password
          </Badge>
          <div>
            <h2 className="text-3xl text-slate-950">Create a new password</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Choose a secure password to continue using your account.
            </p>
          </div>
        </div>

        {message && (
          <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm leading-6 text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Enter new password"
            />
            <p className="text-xs text-slate-500">Minimum 8 characters</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>

          <Button type="submit" className="w-full shadow-lg shadow-primary/15" size="lg" disabled={loading || !token}>
            {loading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>

        <div className="text-sm leading-7 text-slate-600">
          <Link to="/login" className="font-semibold text-secondary hover:text-secondary/80">
            Back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default ResetPassword;
