'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL + '/destinations/categories');
      const data = await res.json();
      setCategories(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchCategories(); }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    
    try {
      const res = await fetch(API_URL + '/admin/destinations/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ name: newName, description: newName + ' destinations' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Failed');
      }

      setNewName('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
      
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      
      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" className="flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" />
        <button onClick={createCategory} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {categories.length === 0 && <p className="p-6 text-gray-500 text-center">No categories yet</p>}
        {categories.map((cat: any) => (
          <div key={cat.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900">{cat.name}</p>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
