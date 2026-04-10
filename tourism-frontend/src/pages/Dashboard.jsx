import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-slate-100 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Dashboard overview</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Welcome back, {user?.first_name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Your central hub for tourism management, activity tracking, and profile updates.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Verification</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{user?.is_email_verified ? 'Verified' : 'Pending'}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Role</p>
              <p className="mt-3 text-2xl font-bold text-slate-950 capitalize">{user?.role || 'Guest'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-950 mb-5">Your profile</h2>
          <div className="space-y-5 text-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-500">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Member Since</p>
              <p className="mt-2 text-lg text-slate-950">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-950 mb-5">Quick facts</h2>
          <div className="space-y-5 text-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-500">Email Verified</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.is_email_verified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Account status</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Last login</p>
              <p className="mt-2 text-lg text-slate-950">{user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Not recorded'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
