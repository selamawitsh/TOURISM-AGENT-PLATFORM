'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';

const AUTH_URL = 'https://auth-service-bgpc.onrender.com/api/v1';

const heroImages = [
  { url: 'https://i.pinimg.com/1200x/31/b8/f8/31b8f86fbd2a2c419b0c6451a9000d72.jpg', title: 'Lalibela', subtitle: 'Rock-Hewn Churches' },
  { url: 'https://i.pinimg.com/736x/fd/68/22/fd6822724c57872d25db2d08957c15f4.jpg', title: 'Simien Mountains', subtitle: 'Roof of Africa' },
  { url: 'https://i.pinimg.com/736x/68/6e/c2/686ec2e0e3a95f0e10c9f5c998a9503d.jpg', title: 'Gondar', subtitle: 'Camelot of Africa' },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      await fetch(`${AUTH_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setMessage('If your email is registered, a reset link will arrive shortly.');
      setEmail('');
    } catch {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const currentImage = heroImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentImageIndex} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 2 }} className="absolute inset-0">
            <img src={currentImage.url} alt={currentImage.title} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-emerald-50/60 to-teal-50/80" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="relative hidden lg:block overflow-hidden rounded-l-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentImageIndex} initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} className="absolute inset-0">
                <img src={currentImage.url} alt={currentImage.title} className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                <p className="text-sm uppercase tracking-wider text-emerald-200 font-semibold mb-2">{currentImage.subtitle}</p>
                <h3 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h3>
                <div className="mt-4 flex gap-2">
                  {heroImages.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-emerald-400' : 'w-3 bg-white/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md space-y-6">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
                <p className="text-gray-600 text-sm">Enter your email to receive a reset link</p>
              </motion.div>

              <AnimatePresence>
                {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</motion.div>}
                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</motion.div>}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email address"
                      className="w-full pl-10 h-11 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none" />
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button type="submit" disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg text-white font-medium rounded-xl flex items-center justify-center gap-2">
                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Mail className="h-4 w-4" />}
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </motion.div>
              </form>
              <div className="text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-500">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
