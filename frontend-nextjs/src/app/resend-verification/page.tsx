'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Sparkles } from 'lucide-react';

const AUTH_URL = 'https://auth-service-bgpc.onrender.com/api/v1';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      await fetch(`${AUTH_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setMessage('Verification email sent! Check your inbox.');
      setEmail('');
    } catch {
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Resend Verification</h2>
          <p className="text-gray-600 text-sm mt-2">Enter your email to receive a new verification link</p>
        </div>
        {message && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com"
                className="w-full pl-10 h-11 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all">
            {loading ? 'Sending...' : 'Send verification email'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
