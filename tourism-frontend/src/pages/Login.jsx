
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authVisuals } from '@/lib/ethiopiaVisuals';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { role } = await login(formData);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      if (errorMsg === 'please verify your email before logging in') {
        setError(
          <span>
            Please verify your email before logging in.{' '}
            <Link to="/resend-verification" className="font-semibold text-secondary underline">
              Resend verification
            </Link>
          </span>
        );
      } else {
        setError(errorMsg || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to a calmer travel dashboard"
      description="Bookings, profiles, and destination planning now sit inside a warmer interface with more atmosphere and less clutter."
      visuals={authVisuals}
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-white/70">
            Account access
          </Badge>
          <div>
            <h2 className="text-3xl text-slate-950">Login to your account</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Enter your email and password to continue into your travel workspace.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <p>Secure access for travelers, agents, and admins.</p>
            <Link to="/forgot-password" className="font-semibold text-secondary hover:text-secondary/80">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full shadow-lg shadow-primary/15" size="lg">
            {loading ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <div className="text-sm leading-7 text-slate-600">
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-secondary hover:text-secondary/80">
            Create an account
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default Login;
