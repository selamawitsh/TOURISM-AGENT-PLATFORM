
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authVisuals } from '@/lib/ethiopiaVisuals';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });

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

  return (
    <AuthShell
      eyebrow="Start your journey"
      title="Create an account for a more beautiful travel workspace"
      description="The updated experience keeps registration simple while giving the platform a stronger Ethiopian-inspired atmosphere from the first visit."
      visuals={authVisuals}
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-white/70">
            Join now
          </Badge>
          <div>
            <h2 className="text-3xl text-slate-950">Create your account</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Register once and move into bookings, routes, and your personalized profile.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm leading-6 text-emerald-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <Input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="First name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <Input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Last name"
              />
            </div>
          </div>

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
              minLength={8}
              placeholder="Choose a secure password"
            />
            <p className="text-xs text-slate-500">Minimum 8 characters</p>
          </div>

          <Button type="submit" className="w-full shadow-lg shadow-primary/15" size="lg">
            {loading ? 'Registering…' : 'Create account'}
          </Button>
        </form>

        <div className="text-sm leading-7 text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-secondary hover:text-secondary/80">
            Login here
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default Register;
