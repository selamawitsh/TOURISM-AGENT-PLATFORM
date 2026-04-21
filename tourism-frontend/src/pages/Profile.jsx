
import React, { useCallback, useEffect, useState } from 'react';
import { Globe, Languages, Mail, MapPin, PencilLine, Phone, Save, UserRound, Wallet } from 'lucide-react';

import { userAPI } from '../services/api';
import { Badge } from '@/components/ui/badge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/designSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', bio: '', country: '', city: '', language: 'en', currency: 'USD' });

  const populateForm = (data) => {
    setFormData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      bio: data.bio || '',
      country: data.country || '',
      city: data.city || '',
      language: data.language || 'en',
      currency: data.currency || 'USD',
    });
  };

  const loadProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      populateForm(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await userAPI.updateProfile(formData);
      setProfile(response.data);
      populateForm(response.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 text-center">
          <CardContent className="p-10">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-5 text-sm text-slate-600">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.trim() || 'ET';
  const detailItems = [
    { label: 'Email', value: profile?.email, icon: Mail },
    { label: 'Phone', value: profile?.phone || 'Not provided', icon: Phone },
    { label: 'Country', value: profile?.country || 'Not provided', icon: Globe },
    { label: 'City', value: profile?.city || 'Not provided', icon: MapPin },
  ];
  const preferenceItems = [
    { label: 'Language', value: profile?.language?.toUpperCase() || 'EN', icon: Languages },
    { label: 'Currency', value: profile?.currency || 'USD', icon: Wallet },
    { label: 'Role', value: profile?.role || 'customer', icon: UserRound },
  ];

  return (
    <div className="space-y-8">
      <section className="woven-surface relative overflow-hidden rounded-[2.35rem] border border-white/50 bg-[linear-gradient(145deg,rgba(19,57,45,0.98),rgba(43,87,68,0.92)_55%,rgba(166,75,34,0.94))] px-6 py-7 text-white shadow-[0_34px_90px_-50px_rgba(16,31,24,0.95)] sm:px-8 sm:py-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,192,102,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="flex items-start gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-[1.8rem] border border-white/12 bg-white/10 text-2xl font-semibold text-white shadow-lg shadow-black/10">
              {initials}
            </div>
            <div className="space-y-3">
              <Badge variant="gold" className="border-white/10 bg-white/10 text-amber-100">
                My profile
              </Badge>
              <div>
                <h1 className="text-4xl text-white sm:text-5xl">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                  Manage your traveler details, preferences, and the identity you bring into every Ethiopian journey on the platform.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="gold" className="border-white/10 bg-white/10 text-white">
                  {profile?.role}
                </Badge>
                <Badge variant="gold" className="border-white/10 bg-white/10 text-white">
                  {profile?.language?.toUpperCase() || 'EN'}
                </Badge>
                <Badge variant="gold" className="border-white/10 bg-white/10 text-white">
                  {profile?.currency || 'USD'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Email status', value: profile?.is_email_verified ? 'Verified' : 'Pending' },
              { label: 'Account', value: profile?.is_active ? 'Active' : 'Inactive' },
              { label: 'Location', value: profile?.city || profile?.country || 'Not set' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{item.label}</p>
                <p className="mt-3 text-xl text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm leading-6 text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {!isEditing ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-white/94">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="w-fit bg-white/80">
                  Identity
                </Badge>
                <CardTitle className="mt-4">Personal details</CardTitle>
                <CardDescription>Core information connected to your account and journey preferences.</CardDescription>
              </div>
              <SecondaryButton type="button" onClick={() => setIsEditing(true)} className="px-3 py-2">
                <PencilLine className="h-4 w-4" />
                Edit profile
              </SecondaryButton>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-[1.5rem] border border-border/70 bg-muted/45 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-white text-primary shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-base leading-7 text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(245,234,216,0.9))]">
            <CardHeader>
              <Badge variant="accent" className="w-fit">
                Preferences
              </Badge>
              <CardTitle>Travel profile and settings</CardTitle>
              <CardDescription>
                Keep your language, currency, and trip notes updated so the experience feels more personal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {preferenceItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-[1.5rem] border border-border/70 bg-white/80 px-4 py-4 soft-outline">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-muted text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-base text-slate-900 capitalize">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.7rem] border border-border/70 bg-white/80 p-5 soft-outline">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Bio</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {profile?.bio || 'Add a short note about your travel style, interests, or the experiences you want more of.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-white/95">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge variant="accent" className="w-fit">
                Editing mode
              </Badge>
              <CardTitle className="mt-4">Update your profile</CardTitle>
              <CardDescription>
                Refine your details and preferences without leaving the page.
              </CardDescription>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-muted/50 px-4 py-3 text-sm text-slate-600">
              Your changes will update the profile card immediately after saving.
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <p className="section-kicker text-secondary">Identity</p>
                    <div className="textile-divider mt-3 max-w-28" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">First Name *</label>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Name *</label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251..."
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="section-kicker text-secondary">About you</p>
                    <div className="textile-divider mt-3 max-w-28" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Bio</label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your travel style, favorite experiences, or goals."
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <p className="section-kicker text-secondary">Location</p>
                    <div className="textile-divider mt-3 max-w-28" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Country</label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">City</label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="section-kicker text-secondary">Preferences</p>
                    <div className="textile-divider mt-3 max-w-28" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Language</label>
                    <Select name="language" value={formData.language} onChange={handleChange}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Currency</label>
                    <Select name="currency" value={formData.currency} onChange={handleChange}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="ETB">ETB (Br)</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <SecondaryButton
                  type="button"
                  className="bg-white/80"
                  onClick={() => {
                    populateForm(profile);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={saving} className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save changes'}
                </PrimaryButton>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
