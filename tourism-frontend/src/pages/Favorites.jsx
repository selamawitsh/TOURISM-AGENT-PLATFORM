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
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      // Handle different possible response structures
      let favoritesData = [];
      if (response.data && Array.isArray(response.data.data)) {
        favoritesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        favoritesData = response.data;
      } else if (Array.isArray(response)) {
        favoritesData = response;
      } else if (response.data && response.data.favorites) {
        favoritesData = response.data.favorites;
      }
      
      console.log('Processed favorites data:', favoritesData);
      
      // Log the structure of the first favorite item to debug
      if (favoritesData.length > 0) {
        console.log('First favorite item structure:', favoritesData[0]);
        console.log('Available properties:', Object.keys(favoritesData[0]));
      }
      
      setFavorites(favoritesData);
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
      await loadFavorites();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  // Helper function to safely get destination properties
  const getDestinationProperty = (favorite, property, defaultValue = '') => {
    // Try multiple possible property names
    const propertyMap = {
      name: ['destination_name', 'name', 'title', 'destinationTitle'],
      city: ['destination_city', 'city', 'location_city'],
      country: ['destination_country', 'country', 'location_country'],
      price: ['destination_price', 'price', 'cost', 'price_per_person'],
      image: ['destination_image', 'image', 'image_url', 'imageUrl', 'photo', 'picture'],
      id: ['destination_id', 'destinationId', 'id', 'favorite_id']
    };
    
    const possibleNames = propertyMap[property] || [property];
    
    for (const name of possibleNames) {
      if (favorite[name] !== undefined && favorite[name] !== null) {
        return favorite[name];
      }
    }
    
    return defaultValue;
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
        {favorites.map((favorite) => {
          // Safely get all properties
          const destinationId = getDestinationProperty(favorite, 'id');
          const destinationName = getDestinationProperty(favorite, 'name', 'Destination');
          const destinationCity = getDestinationProperty(favorite, 'city', '');
          const destinationCountry = getDestinationProperty(favorite, 'country', '');
          const destinationPrice = getDestinationProperty(favorite, 'price', 0);
          const destinationImage = getDestinationProperty(favorite, 'image', 'https://via.placeholder.com/400x300?text=Destination');
          
          // Create a slug for the link
          const slug = destinationName.toLowerCase().replace(/\s+/g, '-');
          
          return (
            <div key={destinationId || favorite.id || Math.random()} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48">
                <img
                  src={destinationImage}
                  alt={destinationName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Destination';
                  }}
                />
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton 
                    destinationId={destinationId} 
                    size="default" 
                    onToggle={() => loadFavorites()}
                  />
                </div>
              </div>
              <div className="p-5">
                <Link to={`/destinations/${slug}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
                    {destinationName}
                  </h3>
                </Link>
                {(destinationCity || destinationCountry) && (
                  <p className="text-gray-500 text-sm mb-2">
                    📍 {[destinationCity, destinationCountry].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">${destinationPrice}</span>
                    <span className="text-sm text-gray-500">/ person</span>
                  </div>
                  <button
                    onClick={() => handleRemove(destinationId)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;