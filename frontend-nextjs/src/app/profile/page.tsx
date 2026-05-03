'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Globe, Languages, Mail, MapPin, PencilLine, Phone, Save, UserRound, Wallet } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: '',
    bio: '',
    country: '',
    city: '',
    language: 'en',
    currency: 'USD'
  });

  if (!user) return <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.trim() || 'ET';

  const detailItems = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: formData.phone || 'Not provided', icon: Phone },
    { label: 'Country', value: formData.country || 'Not provided', icon: Globe },
    { label: 'City', value: formData.city || 'Not provided', icon: MapPin },
  ];
  const preferenceItems = [
    { label: 'Language', value: formData.language?.toUpperCase() || 'EN', icon: Languages },
    { label: 'Currency', value: formData.currency || 'USD', icon: Wallet },
    { label: 'Role', value: user?.role || 'customer', icon: UserRound },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setMessage('Profile updated!'); setIsEditing(false); }
      else throw new Error('Failed');
    } catch { setError('Could not update profile. Try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /> Back to Dashboard</Link>

        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-[2.35rem] border border-white/50 bg-[linear-gradient(145deg,rgba(19,57,45,0.98),rgba(43,87,68,0.92)_55%,rgba(166,75,34,0.94))] px-6 py-7 text-white shadow-[0_34px_90px_-50px_rgba(16,31,24,0.95)] sm:px-8 sm:py-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,192,102,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="flex items-start gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-[1.8rem] border border-white/12 bg-white/10 text-2xl font-semibold shadow-lg">{initials}</div>
              <div className="space-y-3">
                <span className="inline-block border border-white/10 bg-white/10 text-amber-100 text-xs px-3 py-1 rounded-full">My profile</span>
                <h1 className="text-4xl text-white sm:text-5xl">{user?.first_name} {user?.last_name}</h1>
                <p className="text-sm text-white/78">Manage your traveler details and preferences.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-white/10 bg-white/10 text-white text-xs px-3 py-1 rounded-full">{user?.role}</span>
                  <span className="border border-white/10 bg-white/10 text-white text-xs px-3 py-1 rounded-full">{formData.language?.toUpperCase() || 'EN'}</span>
                  <span className="border border-white/10 bg-white/10 text-white text-xs px-3 py-1 rounded-full">{formData.currency || 'USD'}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Email status', value: 'Pending' },
                { label: 'Account', value: 'Active' },
                { label: 'Location', value: formData.city || formData.country || 'Not set' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.6rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{item.label}</p>
                  <p className="mt-3 text-xl text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {message && <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!isEditing ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-white/94 rounded-[2rem] p-6 lg:p-8 shadow-xl border">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="inline-block bg-white/80 text-xs px-3 py-1 rounded-full border">Identity</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-3">Personal details</h2>
                </div>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50"><PencilLine className="h-4 w-4" /> Edit</button>
              </div>
              <div className="space-y-4">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border bg-gray-50/45 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-white text-emerald-700 shadow-sm"><item.icon className="h-4 w-4" /></span>
                      <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p><p className="mt-2 text-base text-slate-900">{item.value}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(245,234,216,0.9))] rounded-[2rem] p-6 lg:p-8 shadow-xl border">
              <span className="inline-block bg-amber-50 text-xs px-3 py-1 rounded-full border">Preferences</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3 mb-6">Travel settings</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {preferenceItems.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border bg-white/80 px-4 py-4">
                    <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-gray-100 text-emerald-700"><item.icon className="h-4 w-4" /></span>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-base text-slate-900 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 rounded-[2rem] p-6 lg:p-8 shadow-xl border">
            <span className="inline-block bg-amber-50 text-xs px-3 py-1 rounded-full border mb-4">Editing mode</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Update your profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  {['first_name','last_name','phone','bio','country','city'].map(field => (
                    <div key={field}><label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{field.replace('_',' ')}</label>
                      {field === 'bio' ? (
                        <textarea value={(formData as any)[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none" />
                      ) : (
                        <input value={(formData as any)[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Language</label><select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none"><option value="en">English</option><option value="fr">French</option></select></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Currency</label><select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none"><option value="USD">USD</option><option value="ETB">ETB</option></select></div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 border rounded-xl">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
