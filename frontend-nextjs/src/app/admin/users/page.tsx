'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Users, Trash2, Search, Plus, X } from 'lucide-react';

const USER_URL = 'https://user-service-4dzu.onrender.com/api/v1';
const AUTH_URL = 'https://auth-service-bgpc.onrender.com/api/v1';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'customer' });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${USER_URL}/admin/users`, { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      setUsers(data?.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchUsers(); }, [token]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await fetch(`${USER_URL}/admin/users/${userId}/role`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch {}
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await fetch(`${USER_URL}/admin/users/${userId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      fetchUsers();
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      setShowCreate(false);
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: 'customer' });
      fetchUsers();
    } catch {}
  };

  const filtered = users.filter((u: any) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users ({users.length})</h2>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">{['User', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {filtered.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">{u.first_name?.[0]}{u.last_name?.[0]}</div><span className="font-medium">{u.first_name} {u.last_name}</span></div></td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none"><option value="customer">Customer</option><option value="agent">Agent</option><option value="admin">Admin</option></select></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => setShowDetail(u)} className="text-sm text-emerald-600 hover:underline mr-2">View</button><button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No users found</p>}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">User Details</h3><button onClick={() => setShowDetail(null)}><X className="h-5 w-5" /></button></div>
            <div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">{showDetail.first_name?.[0]}{showDetail.last_name?.[0]}</div><div><p className="text-xl font-bold">{showDetail.first_name} {showDetail.last_name}</p><p className="text-gray-500">{showDetail.email}</p></div></div>
            <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-500">Role</p><p className="font-medium capitalize">{showDetail.role}</p></div><div><p className="text-gray-500">Status</p><p className="font-medium">{showDetail.is_active ? 'Active' : 'Inactive'}</p></div><div><p className="text-gray-500">Verified</p><p className="font-medium">{showDetail.is_email_verified ? 'Yes' : 'No'}</p></div><div><p className="text-gray-500">Joined</p><p className="font-medium">{new Date(showDetail.created_at).toLocaleDateString()}</p></div></div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Create User</h3><button onClick={() => setShowCreate(false)}><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">First Name</label><input value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Last Name</label><input value={newUser.last_name} onChange={e => setNewUser({...newUser, last_name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required minLength={8} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Role</label><select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="customer">Customer</option><option value="agent">Agent</option><option value="admin">Admin</option></select></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
