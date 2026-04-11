
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Admin dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Welcome, {user?.first_name}! 👑</h1>
            <p className="mt-3 text-slate-600">Monitor users, bookings, and platform insights with a refined administrator view.</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-6 py-5 text-slate-700 shadow-sm">
            <p className="text-sm font-medium">Your role</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 capitalize">{user?.role}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-700 to-sky-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">Total Users</p>
              <p className="mt-3 text-3xl font-bold">1,234</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <svg className="h-10 w-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-100">Total Bookings</p>
              <p className="mt-3 text-3xl font-bold">567</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <svg className="h-10 w-10 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-purple-500 to-fuchsia-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Revenue</p>
              <p className="mt-3 text-3xl font-bold">$45.2K</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <svg className="h-10 w-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-100">Active Tours</p>
              <p className="mt-3 text-3xl font-bold">42</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <svg className="h-10 w-10 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-950 mb-4">User Management</h3>
          <p className="text-slate-600 mb-4">Manage user accounts, roles, and permissions across the platform.</p>
          <Link to="/admin/users" className="text-secondary font-semibold hover:text-secondary/80">Manage Users →</Link>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-950 mb-4">Analytics</h3>
          <p className="text-slate-600 mb-4">View platform insights and key performance metrics.</p>
          <Link to="/admin/analytics" className="text-secondary font-semibold hover:text-secondary/80">View Analytics →</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
