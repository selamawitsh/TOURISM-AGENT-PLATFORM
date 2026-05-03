'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';

const heroImages = [
  { url: 'https://i.pinimg.com/1200x/31/b8/f8/31b8f86fbd2a2c419b0c6451a9000d72.jpg', title: 'Lalibela', subtitle: 'Rock-Hewn Churches', quote: 'Begin Your Sacred Journey' },
  { url: 'https://i.pinimg.com/736x/fd/68/22/fd6822724c57872d25db2d08957c15f4.jpg', title: 'Simien Mountains', subtitle: 'Roof of Africa', quote: 'Where Adventure Begins' },
  { url: 'https://i.pinimg.com/736x/68/6e/c2/686ec2e0e3a95f0e10c9f5c998a9503d.jpg', title: 'Gondar', subtitle: 'Camelot of Africa', quote: 'Discover Royal Heritage' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Redirect immediately if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) router.push('/admin/dashboard');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(formData.email, formData.password);
      // Redirect handled by useEffect above
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const currentImage = heroImages[currentImageIndex];

  // Don't show login form if already authenticated
  if (isAuthenticated) return null;

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
        <div className="grid lg:grid-cols-2 min-h-[550px]">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative hidden lg:block overflow-hidden rounded-l-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentImageIndex} initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0">
                <img src={currentImage.url} alt={currentImage.title} className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                <p className="text-sm uppercase tracking-wider text-emerald-200 font-semibold mb-2">{currentImage.subtitle}</p>
                <h3 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h3>
                <p className="text-white/90 italic text-sm">{currentImage.quote}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-sm space-y-5">
              <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg mb-4"><Sparkles className="h-7 w-7 text-white" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-600 text-sm mt-1">Sign in to continue</p>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 h-11 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 outline-none" /></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-10 h-11 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                <button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <LogIn className="h-4 w-4" />}{loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-600">Don't have an account? <Link href="/auth/register" className="font-medium text-emerald-600">Create account</Link></p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
