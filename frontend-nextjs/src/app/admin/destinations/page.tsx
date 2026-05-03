'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, MapPin, Star, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', short_description: '', description: '', country: '', city: '',
    price_per_person: 0, duration: 1, max_people: 20, difficulty: 'easy',
    category_id: '', main_image: '', is_featured: false, included: [] as string[], excluded: [] as string[],
  });
  const [includedInput, setIncludedInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

  const fetchData = async () => {
    try {
      const [destRes, catRes] = await Promise.all([
        fetch(`${DEST_URL}/destinations?page_size=100`),
        fetch(`${API_URL}/destinations/categories`),
      ]);
      const destData = await destRes.json();
      const catData = await catRes.json();
      setDestinations(Array.isArray(destData?.data?.data) ? destData.data.data : Array.isArray(destData?.data) ? destData.data : []);
      setCategories(catData?.data || catData || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (dest: any) => {
    setEditingDest(dest);
    setFormData({
      name: dest.name || '', short_description: dest.short_description || '', description: dest.description || '',
      country: dest.country || '', city: dest.city || '', price_per_person: dest.price_per_person || 0,
      duration: dest.duration || 1, max_people: dest.max_people || 20, difficulty: dest.difficulty || 'easy',
      category_id: dest.category?.id || '', main_image: dest.main_image || '', is_featured: dest.is_featured || false,
      included: dest.included || [], excluded: dest.excluded || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    try {
      await fetch(`${DEST_URL}/admin/destinations/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      fetchData();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...formData, included: formData.included.filter(i => i.trim()), excluded: formData.excluded.filter(i => i.trim()) };
    const url = editingDest ? `${DEST_URL}/admin/destinations/${editingDest.id}` : `${DEST_URL}/admin/destinations`;
    try {
      await fetch(url, {
        method: editingDest ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      });
      setShowModal(false);
      setEditingDest(null);
      fetchData();
    } catch { setError('Failed to save'); }
  };

  const filtered = destinations.filter((d: any) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-12"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Destinations ({destinations.length})</h2>
        <button onClick={() => { setEditingDest(null); setFormData({ name: '', short_description: '', description: '', country: '', city: '', price_per_person: 0, duration: 1, max_people: 20, difficulty: 'easy', category_id: '', main_image: '', is_featured: false, included: [], excluded: [] }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"><Plus className="h-4 w-4" /> Add New</button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search destinations..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">{['Destination', 'Location', 'Price', 'Status', 'Actions'].map((h) => (<th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-600">{h}</th>))}</tr></thead>
          <tbody className="divide-y">
            {filtered.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={d.main_image || ''} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" /><div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.duration || 0} days</p></div></div></td>
                <td className="px-4 py-3 text-sm text-gray-600">{d.city}, {d.country}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(d.price_per_person)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${d.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{d.is_featured ? 'Featured' : 'Normal'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={() => handleEdit(d)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingDest ? 'Edit' : 'Add'} Destination</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Name *</label><input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Country *</label><input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">City</label><input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">None</option>{categories.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Price ($) *</label><input type="number" value={formData.price_per_person} onChange={(e) => setFormData({...formData, price_per_person: +e.target.value})} required min="0" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Duration (days) *</label><input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: +e.target.value})} required min="1" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Max People</label><input type="number" value={formData.max_people} onChange={(e) => setFormData({...formData, max_people: +e.target.value})} min="1" className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Difficulty</label><select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Image URL</label><input value={formData.main_image} onChange={(e) => setFormData({...formData, main_image: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} /><span className="text-sm">Feature on homepage</span></label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600">{editingDest ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
