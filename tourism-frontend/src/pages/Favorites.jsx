import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';

const Favorites = () => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await favoritesAPI.getFavorites();
      console.log('Favorites response:', response.data);
      // The API returns { data: [...], total: ... }
      setFavorites(response.data.data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (destinationId) => {
    try {
      await favoritesAPI.removeFavorite(destinationId);
      // Refresh the list after removal
      await loadFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to see your favorites</h2>
        <p className="text-gray-600 mb-6">Save your favorite destinations and plan your next adventure!</p>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
        <button
          onClick={loadFavorites}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-6">Start exploring destinations and save your favorites!</p>
        <Link to="/destinations" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Browse Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">You have {favorites.length} saved {favorites.length === 1 ? 'destination' : 'destinations'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group">
            <div className="relative h-48">
              <img
                src={favorite.destination_image || 'https://via.placeholder.com/400x300?text=Destination'}
                alt={favorite.destination_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Destination';
                }}
              />
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton 
                  destinationId={favorite.destination_id} 
                  size="default" 
                  onToggle={() => loadFavorites()}
                />
              </div>
            </div>
            <div className="p-5">
              <Link to={`/destinations/${favorite.destination_name?.toLowerCase().replace(/\s+/g, '-')}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
                  {favorite.destination_name}
                </h3>
              </Link>
              <p className="text-gray-500 text-sm mb-2">
                📍 {favorite.destination_city}, {favorite.destination_country}
              </p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${favorite.destination_price}</span>
                  <span className="text-sm text-gray-500">/ person</span>
                </div>
                <button
                  onClick={() => handleRemove(favorite.destination_id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;