import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              Profile overview
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
          </div>
          <div className="rounded-3xl bg-sky-50 px-5 py-4 text-slate-700 shadow-sm">
            <p className="text-sm font-medium">Account status</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{user?.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Personal details</h2>
          <div className="space-y-5 text-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-500">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Activity</h2>
          <div className="space-y-5 text-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-500">Member Since</p>
              <p className="mt-2 text-lg text-slate-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Last Login</p>
              <p className="mt-2 text-lg text-slate-900">{user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'No recent login'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email verified</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{user?.is_email_verified ? 'Yes' : 'Not yet'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
