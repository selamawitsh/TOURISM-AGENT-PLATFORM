'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

const AUTH_URL = 'https://auth-service-bgpc.onrender.com/api/v1';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Min 8 characters'); return; }
    setLoading(true); setMessage(''); setError('');
    try {
      await fetch(`${AUTH_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, new_password: password }) });
      setMessage('Password reset! Redirecting...');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch { setError('Failed'); }
    finally { setLoading(false); }
  };

  if (!token) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">No reset token</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8">
        <div className="text-center mb-6"><div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg mb-4"><Sparkles className="h-7 w-7 text-white" /></div><h2 className="text-2xl font-bold text-gray-900">Reset Password</h2></div>
        {message && <div className="mb-4 p-4 bg-emerald-50 rounded-xl text-emerald-700 text-sm">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 rounded-xl text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="New password" className="w-full px-4 h-11 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 outline-none" /></div>
          <div><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required placeholder="Confirm password" className="w-full px-4 h-11 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 outline-none" /></div>
          <button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl">{loading?'Resetting...':'Reset'}</button>
        </form>
        <div className="text-center mt-4"><Link href="/auth/login" className="text-sm text-emerald-600">Back to login</Link></div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>}><ResetPasswordContent /></Suspense>;
}
