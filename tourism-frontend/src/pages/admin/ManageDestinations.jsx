import React, { useState, useEffect } from 'react';
import { destinationAPI } from '../../services/api';

const ManageDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    country: '',
    city: '',
    price_per_person: '',
    duration: '',
    max_people: 20,
    difficulty: 'easy',
    category_id: '',
    main_image: '',
    is_featured: false,
    included: [],
    excluded: [],
  });
  const [includedInput, setIncludedInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');

  useEffect(() => {
    loadDestinations();
    loadCategories();
  }, []);

  const loadDestinations = async () => {
    try {
      const response = await destinationAPI.getAllDestinations(1, 100);
      setDestinations(response.data.data);
    } catch (err) {
      setError('Failed to load destinations');
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await destinationAPI.getAllCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prepare data - ensure all required fields are present
      const submitData = {
        name: formData.name,
        country: formData.country,
        price_per_person: parseFloat(formData.price_per_person),
        duration: parseInt(formData.duration),
        short_description: formData.short_description || '',
        description: formData.description || '',
        city: formData.city || '',
        max_people: parseInt(formData.max_people) || 20,
        difficulty: formData.difficulty || 'easy',
        main_image: formData.main_image || '',
        is_featured: formData.is_featured || false,
        included: formData.included || [],
        excluded: formData.excluded || [],
      };
      
      // Only add category_id if it has a value
      if (formData.category_id) {
        submitData.category_id = formData.category_id;
      }
      
      console.log('Submitting destination:', submitData);
      
      if (editingDestination) {
        await destinationAPI.updateDestination(editingDestination.id, submitData);
      } else {
        await destinationAPI.createDestination(submitData);
      }
      setShowModal(false);
      resetForm();
      loadDestinations();
    } catch (err) {
      console.error('Save error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save destination';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
      await destinationAPI.deleteDestination(id);
      loadDestinations();
    } catch (err) {
      setError('Failed to delete destination');
      console.log(err);
    }
  };

  const handleEdit = (destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name || '',
      short_description: destination.short_description || '',
      description: destination.description || '',
      country: destination.country || '',
      city: destination.city || '',
      price_per_person: destination.price_per_person || '',
      duration: destination.duration || '',
      max_people: destination.max_people || 20,
      difficulty: destination.difficulty || 'easy',
      category_id: destination.category?.id || '',
      main_image: destination.main_image || '',
      is_featured: destination.is_featured || false,
      included: destination.included || [],
      excluded: destination.excluded || [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDestination(null);
    setFormData({
      name: '',
      short_description: '',
      description: '',
      country: '',
      city: '',
      price_per_person: '',
      duration: '',
      max_people: 20,
      difficulty: 'easy',
      category_id: '',
      main_image: '',
      is_featured: false,
      included: [],
      excluded: [],
    });
    setIncludedInput('');
    setExcludedInput('');
  };

  const addIncluded = () => {
    if (includedInput.trim()) {
      setFormData({
        ...formData,
        included: [...formData.included, includedInput.trim()],
      });
      setIncludedInput('');
    }
  };

  const removeIncluded = (index) => {
    setFormData({
      ...formData,
      included: formData.included.filter((_, i) => i !== index),
    });
  };

  const addExcluded = () => {
    if (excludedInput.trim()) {
      setFormData({
        ...formData,
        excluded: [...formData.excluded, excludedInput.trim()],
      });
      setExcludedInput('');
    }
  };

  const removeExcluded = (index) => {
    setFormData({
      ...formData,
      excluded: formData.excluded.filter((_, i) => i !== index),
    });
  };

  if (loading && destinations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Destinations</h1>
            <p className="text-green-100 mt-1">Add, edit, or remove tour destinations</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition font-medium"
          >
            + Add Destination
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Destinations Table */}
        <div className="overflow-x-auto p-6">
          {destinations.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              No destinations yet. Click "Add Destination" to create one.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={dest.main_image || 'https://via.placeholder.com/40'} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{dest.name}</div>
                      <div className="text-sm text-gray-500">{dest.duration} days</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{dest.city}, {dest.country}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${dest.price_per_person}</td>
                    <td className="px-6 py-4">
                      {dest.is_featured ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(dest)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dest.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 my-8 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDestination ? 'Edit Destination' : 'Add New Destination'}
            </h2>
            
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      value={formData.price_per_person}
                      onChange={(e) => setFormData({...formData, price_per_person: e.target.value})}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max People</label>
                    <input
                      type="number"
                      value={formData.max_people}
                      onChange={(e) => setFormData({...formData, max_people: e.target.value})}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                    <input
                      type="url"
                      value={formData.main_image}
                      onChange={(e) => setFormData({...formData, main_image: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                    Feature this destination (show on homepage)
                  </label>
                </div>

                {/* Included Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's Included</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={includedInput}
                      onChange={(e) => setIncludedInput(e.target.value)}
                      placeholder="e.g., Hotel accommodation"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addIncluded}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.included.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeIncluded(idx)}
                          className="ml-2 text-green-700 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excluded Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's Excluded</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={excludedInput}
                      onChange={(e) => setExcludedInput(e.target.value)}
                      placeholder="e.g., Flight tickets"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addExcluded}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.excluded.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeExcluded(idx)}
                          className="ml-2 text-red-700 hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingDestination ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDestinations;