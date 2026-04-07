import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/5 py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-cyan-500/10 via-white to-slate-50 p-10 shadow-2xl">
          <div className="max-w-xl space-y-5">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
              Welcome back
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Login to manage your tourism dashboard
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Sign in to view your bookings, stay connected with travelers, and keep your platform details up to date.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Secure access</p>
              <p className="mt-2 text-sm text-slate-600">Your credentials are protected and encrypted.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Fast login</p>
              <p className="mt-2 text-sm text-slate-600">Get back to planning travel faster with quick access.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              Account access
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to continue to your tourism dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full rounded-2xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
