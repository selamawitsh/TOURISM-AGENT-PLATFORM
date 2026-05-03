'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function CreateDestinationPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    country: 'Ethiopia',
    city: '',
    price_per_person: 0,
    discount_price: 0,
    duration: 1,
    max_people: 10,
    difficulty: 'moderate',
    category_id: '',
    included: [''],
    excluded: [''],
    main_image: '',
    is_featured: false,
  });

  useEffect(() => {
    fetch(API_URL + '/destinations/categories')
      .then((res) => res.json())
      .then((data) => {
        const cats = data?.data || data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => console.log('Categories not loaded:', err));
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleCheckbox = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleArrayChange = (field: 'included' | 'excluded', index: number, value: string) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: 'included' | 'excluded') => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'included' | 'excluded', index: number) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const currentToken = localStorage.getItem('access_token');
      
      if (!currentToken) {
        throw new Error('Please log in again');
      }

      const body: any = {
        name: form.name,
        short_description: form.short_description,
        description: form.description,
        country: form.country,
        city: form.city,
        price_per_person: form.price_per_person,
        discount_price: form.discount_price,
        duration: form.duration,
        max_people: form.max_people,
        difficulty: form.difficulty,
        main_image: form.main_image || undefined,
        is_featured: form.is_featured,
        included: form.included.filter((i) => i.trim()),
        excluded: form.excluded.filter((i) => i.trim()),
      };

      if (form.category_id) {
        body.category_id = form.category_id;
      }

      const res = await fetch(API_URL + '/admin/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + currentToken,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        // Try to refresh token
        const refreshTok = localStorage.getItem('refresh_token');
        if (refreshTok) {
          const refreshRes = await fetch(API_URL + '/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshTok }),
          });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('access_token', refreshData.access_token);
            
            // Retry with new token
            const retryRes = await fetch(API_URL + '/admin/destinations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + refreshData.access_token,
              },
              body: JSON.stringify(body),
            });
            
            if (!retryRes.ok) {
              const err = await retryRes.json().catch(() => ({}));
              throw new Error(err.error || err.message || 'Failed');
            }
            
            setSuccess('Destination created!');
            setTimeout(() => router.push('/admin/dashboard'), 1500);
            return;
          }
        }
        
        throw new Error('Session expired. Please log in again.');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Failed');
      }

      setSuccess('Destination created!');
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Please <Link href="/auth/login" className="text-emerald-700 underline">log in</Link> to create destinations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <h2 className="text-2xl font-bold text-gray-900">Create Destination</h2>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          <div><label className="block text-sm font-medium mb-1">Name *</label><input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          <div><label className="block text-sm font-medium mb-1">Short Description</label><input name="short_description" value={form.short_description} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          <div><label className="block text-sm font-medium mb-1">Full Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Country *</label><input name="country" value={form.country} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold">Pricing & Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price ($) *</label><input type="number" name="price_per_person" value={form.price_per_person} onChange={handleChange} required min={0} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Discount ($)</label><input type="number" name="discount_price" value={form.discount_price} onChange={handleChange} min={0} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Duration (days) *</label><input type="number" name="duration" value={form.duration} onChange={handleChange} required min={1} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Max People</label><input type="number" name="max_people" value={form.max_people} onChange={handleChange} min={1} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Difficulty</label><select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Challenging</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Category</label><select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"><option value="">None</option>{categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold">Image</h3>
          <div><label className="block text-sm font-medium mb-1">Main Image URL</label><input name="main_image" value={form.main_image} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://images.unsplash.com/..." /></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold">Included / Excluded</h3>
          <div><label className="block text-sm font-medium mb-2">Included</label>{form.included.map((item, i) => (<div key={i} className="flex gap-2 mb-2"><input value={item} onChange={(e) => handleArrayChange('included', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border outline-none" /><button type="button" onClick={() => removeArrayItem('included', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="h-4 w-4" /></button></div>))}<button type="button" onClick={() => addArrayItem('included')} className="flex items-center gap-1 text-sm text-emerald-600"><Plus className="h-4 w-4" /> Add</button></div>
          <div><label className="block text-sm font-medium mb-2">Excluded</label>{form.excluded.map((item, i) => (<div key={i} className="flex gap-2 mb-2"><input value={item} onChange={(e) => handleArrayChange('excluded', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border outline-none" /><button type="button" onClick={() => removeArrayItem('excluded', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="h-4 w-4" /></button></div>))}<button type="button" onClick={() => addArrayItem('excluded')} className="flex items-center gap-1 text-sm text-emerald-600"><Plus className="h-4 w-4" /> Add</button></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleCheckbox} className="w-5 h-5 rounded text-emerald-600" /><span className="text-sm font-medium">Feature on homepage</span></label>
        </div>

        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50">{loading ? 'Creating...' : 'Create Destination'}</button>
      </form>
    </div>
  );
}
