'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';

export default function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    country: '',
    city: '',
    price_per_person: 0,
    discount_price: 0,
    duration: 0,
    max_people: 0,
    difficulty: 'moderate',
    main_image: '',
    is_featured: false,
    included: [''],
    excluded: [''],
  });

  useEffect(() => {
    fetch(`${API_URL}/destinations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const d = data?.data || data;
        if (d) {
          setForm({
            name: d.name || '',
            short_description: d.short_description || '',
            description: d.description || '',
            country: d.country || '',
            city: d.city || '',
            price_per_person: d.price_per_person || 0,
            discount_price: d.discount_price || 0,
            duration: d.duration || 0,
            max_people: d.max_people || 0,
            difficulty: d.difficulty || 'moderate',
            main_image: d.main_image || '',
            is_featured: d.is_featured || false,
            included: d.included?.length ? d.included : [''],
            excluded: d.excluded?.length ? d.excluded : [''],
          });
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleCheckbox = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('access_token');
    
    try {
      const res = await fetch(`${DEST_URL}/admin/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update');
      setSuccess('Updated successfully!');
      setTimeout(() => router.push('/admin/destinations'), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/destinations" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <h2 className="text-2xl font-bold text-gray-900">Edit Destination</h2>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          <div><label className="block text-sm font-medium mb-1">Name</label><input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price ($)</label><input type="number" name="price_per_person" value={form.price_per_person} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium mb-1">Duration (days)</label><input type="number" name="duration" value={form.duration} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleCheckbox} className="w-5 h-5 rounded text-emerald-600" /><span className="text-sm font-medium">Featured</span></label>
        </div>

        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50">
          <Save className="h-5 w-5" />{loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
