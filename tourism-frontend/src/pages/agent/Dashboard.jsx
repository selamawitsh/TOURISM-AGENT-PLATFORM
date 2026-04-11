
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AgentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Agent dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Welcome back, {user?.first_name}! 🎫</h1>
            <p className="mt-3 text-slate-600">Manage bookings, clients, and tours from one polished dashboard.</p>
          </div>
          <div className="rounded-3xl bg-sky-50 px-6 py-5 text-slate-700 shadow-sm">
            <p className="text-sm font-medium">Your role</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 capitalize">{user?.role}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 00-2-2M15 3v2a2 2 0 002 2h2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">Manage Bookings</h3>
          <p className="text-slate-600 mb-4">Handle customer reservations and confirm their travel plans.</p>
          <Link to="/agent/bookings" className="text-secondary font-semibold hover:text-secondary/80">Manage Bookings →</Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">Client List</h3>
          <p className="text-slate-600 mb-4">Keep your customers close and manage their travel needs easily.</p>
          <Link to="/agent/clients" className="text-secondary font-semibold hover:text-secondary/80">View Clients →</Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-950 mb-2">Manage Tours</h3>
          <p className="text-slate-600 mb-4">Build and publish tour offerings for every region in Ethiopia.</p>
          <Link to="/agent/tours" className="text-secondary font-semibold hover:text-secondary/80">Manage Tours →</Link>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
