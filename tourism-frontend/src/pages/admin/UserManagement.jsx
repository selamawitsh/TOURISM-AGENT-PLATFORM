
import React, { useCallback, useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import ErrorMessage from '../../components/admin/ErrorMessage';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import Pagination from '../../components/admin/Pagination';
import DataTable from '../../components/admin/DataTable';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'customer', phone: '' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers(page, 10);
      setUsers(response.data.data || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(true);
    try {
      await userAPI.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      setError('Failed to update role');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setUpdating(true);
    try {
      await userAPI.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await userAPI.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: 'customer', phone: '' });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const headers = [
    'User',
    'Email',
    'Role',
    'Status',
    'Joined',
    'Actions'
  ];

  const renderRow = (user) => (
    <tr key={user.id} className="hover:bg-ethiopian-yellow/10 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-ethiopian-blue to-ethiopian-green rounded-full flex items-center justify-center text-white font-semibold">
            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-ethiopian-blue">{user.first_name} {user.last_name}</div>
            <div className="text-sm text-gray-500">ID: {user.id?.substring(0, 8)}...</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
      <td className="px-6 py-4">
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          disabled={updating}
          className="text-sm rounded-full px-3 py-1 font-semibold border-0 focus:ring-2 focus:ring-ethiopian-blue bg-ethiopian-blue/10 text-ethiopian-blue"
        >
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
      </td>
      <td className="px-6 py-4 text-gray-500 text-sm">
        {new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
        <button
          onClick={() => { setSelectedUser(user); setShowModal(true); }}
          className="text-ethiopian-blue hover:text-ethiopian-green font-medium transition-colors px-3 py-1 rounded-lg hover:bg-ethiopian-blue/10"
        >
          View
        </button>
        <button
          onClick={() => handleDeleteUser(user.id)}
          disabled={updating}
          className="text-ethiopian-red hover:text-red-700 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-ethiopian-blue via-ethiopian-green to-ethiopian-gold rounded-3xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-ethiopian-yellow/90 text-lg">Manage every account across your Ethiopian tourism platform</p>
        <div className="mt-6 flex items-center space-x-2">
          <div className="w-12 h-1 bg-ethiopian-yellow rounded-full"></div>
          <div className="w-8 h-1 bg-ethiopian-green rounded-full"></div>
          <div className="w-4 h-1 bg-ethiopian-red rounded-full"></div>
        </div>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
          <Button
            type="button"
            className="bg-ethiopian-green hover:bg-ethiopian-green/90 text-white rounded-full px-6 py-2 font-semibold"
            onClick={() => setShowCreateModal(true)}
          >
            + Add User
          </Button>
        </div>

        <DataTable
          headers={headers}
          data={users}
          renderRow={renderRow}
          loading={loading && users.length === 0}
          emptyMessage="No users found yet. Ethiopia welcomes all travelers!"
        />

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-ethiopian-blue to-ethiopian-green rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-ethiopian-blue">{selectedUser.first_name} {selectedUser.last_name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Role</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedUser.role} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Status</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedUser.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Phone</p>
                  <p className="mt-1 text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Country</p>
                  <p className="mt-1 text-gray-900">{selectedUser.country || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">City</p>
                  <p className="mt-1 text-gray-900">{selectedUser.city || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ethiopian-blue uppercase tracking-wide">Joined</p>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors bg-white"
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ethiopian-blue uppercase tracking-wide mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ethiopian-blue focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-6 py-2 border-gray-300"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-ethiopian-green hover:bg-ethiopian-green/90 text-white rounded-full px-6 py-2 font-semibold"
              disabled={updating}
            >
              {updating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
