import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await register(formData);
      setSuccessMessage(response.message || 'Registration successful! Please check your email to verify your account.');
      setFormData({ first_name: '', last_name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-sky-100 via-white to-cyan-100 p-10 shadow-2xl">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex rounded-full bg-sky-600/10 px-3 py-1 text-sm font-semibold text-sky-700">
              Start here
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Create your tourism profile
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Register now and start managing trips, bookings, and customer requests with ease.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Fast signup</p>
              <p className="mt-2 text-sm text-slate-600">Create your account in moments and start using the platform.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Verified access</p>
              <p className="mt-2 text-sm text-slate-600">Email verification keeps your account secure and trusted.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
              Join the platform
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Register your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in your details and finish registration with a secure password.
            </p>
          </div>

          {successMessage && (
            <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm mb-6">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700 shadow-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              <p className="text-xs text-slate-500 mt-2">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
