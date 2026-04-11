
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authVisuals } from '@/lib/ethiopiaVisuals';

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
    <AuthShell
      eyebrow="Email verification"
      title="Send a fresh verification link"
      description="If the first message never arrived, you can request a new verification email and continue with the refreshed visual flow."
      visuals={authVisuals.slice(1)}
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-white/70">
            Verify your email
          </Badge>
          <div>
            <h2 className="text-3xl text-slate-950">Resend verification</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Enter the account email and we&apos;ll send you a fresh link.
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
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <Button type="submit" className="w-full shadow-lg shadow-primary/15" size="lg">
            {loading ? 'Sending…' : 'Send verification email'}
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

export default ResendVerification;
