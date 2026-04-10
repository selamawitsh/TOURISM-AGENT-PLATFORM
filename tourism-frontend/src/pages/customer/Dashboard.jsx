import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Customer dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Welcome back, {user?.first_name}! 👋</h1>
            <p className="mt-3 text-slate-600">Explore amazing tours, track your bookings, and manage your profile with ease.</p>
          </div>
          <div className="rounded-3xl bg-sky-50 px-6 py-5 text-slate-700 shadow-sm">
            <p className="text-sm font-medium">Current role</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 capitalize">{user?.role}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">Browse Tours</h3>
          <p className="text-slate-600 mb-4">Discover top destinations and book your next adventure.</p>
          <Link to="/tours" className="text-sky-600 font-semibold hover:text-sky-700">Explore Tours →</Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">My Bookings</h3>
          <p className="text-slate-600 mb-4">Track current reservations and upcoming travel plans.</p>
          <Link to="/bookings" className="text-sky-600 font-semibold hover:text-sky-700">View Bookings →</Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">My Profile</h3>
          <p className="text-slate-600 mb-4">Edit your information and account preferences.</p>
          <Link to="/profile" className="text-sky-600 font-semibold hover:text-sky-700">View Profile →</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
