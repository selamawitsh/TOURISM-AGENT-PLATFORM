import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, UserPlus, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await register(formData);
      setSuccessMessage(response.message || 'Registration successful! Please verify your email.');
      setFormData({ first_name: '', last_name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Ethiopian tourism images
  const heroImages = [
    {
      url: 'https://i.pinimg.com/1200x/31/b8/f8/31b8f86fbd2a2c419b0c6451a9000d72.jpg',
      title: 'Lalibela',
      subtitle: 'Rock-Hewn Churches',
      quote: 'Begin Your Sacred Journey'
    },
    {
      url: 'https://i.pinimg.com/736x/fd/68/22/fd6822724c57872d25db2d08957c15f4.jpg',
      title: 'Simien Mountains',
      subtitle: 'Roof of Africa',
      quote: 'Where Adventure Begins'
    },
    {
      url: 'https://i.pinimg.com/736x/68/6e/c2/686ec2e0e3a95f0e10c9f5c998a9503d.jpg',
      title: 'Gondar',
      subtitle: 'Camelot of Africa',
      quote: 'Discover Royal Heritage'
    }
  ];

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentImage = heroImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img
              src={currentImage.url}
              alt={currentImage.title}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-emerald-50/60 to-teal-50/80" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Image */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative hidden lg:block overflow-hidden rounded-l-3xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />

            {/* Content Overlay */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-8 left-8 right-8"
            >
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                <motion.div
                  key={currentImageIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-sm uppercase tracking-wider text-emerald-200 font-semibold mb-2">
                    {currentImage.subtitle}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {currentImage.title}
                  </h3>
                  <p className="text-white/90 italic text-sm">
                    "{currentImage.quote}"
                  </p>
                </motion.div>

                {/* Image Indicators */}
                <div className="mt-4 flex gap-2">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex
                          ? 'w-6 bg-emerald-400'
                          : 'w-3 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center justify-center p-8 lg:p-12"
          >
            <div className="w-full max-w-md space-y-6">
              {/* Header */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create account
                </h2>
                <p className="text-gray-600 text-sm">
                  Join us to explore amazing destinations
                </p>
              </motion.div>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Name Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      <Input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        placeholder="your name"
                        className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 border-gray-200 focus:border-emerald-400"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="last name"
                      className="h-11 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 border-gray-200 focus:border-emerald-400"
                    />
                  </motion.div>
                </div>

                {/* Email Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your email address"
                      className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 border-gray-200 focus:border-emerald-400"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      className="pl-10 pr-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 border-gray-200 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create account
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Login Link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-sm text-gray-600"
              >
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                  Sign in
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;