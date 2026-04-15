import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../services/api';

const FavoriteButton = ({ destinationId, size = 'default', onToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && destinationId) {
      checkFavoriteStatus();
    }
  }, [destinationId, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.checkFavorite(destinationId);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggle = async () => {
  if (!isAuthenticated) return;
  if (loading) return;

  setLoading(true);
  try {
    if (isFavorite) {
      console.log('Removing from favorites...');
      await favoritesAPI.removeFavorite(destinationId);
      setIsFavorite(false);
      if (onToggle) onToggle(false);
      // Force a small delay to ensure backend processes the delete
      await new Promise(resolve => setTimeout(resolve, 500));
      // Re-check status to confirm
      await checkFavoriteStatus();
    } else {
      console.log('Adding to favorites...');
      await favoritesAPI.addFavorite(destinationId);
      setIsFavorite(true);
      if (onToggle) onToggle(true);
      await checkFavoriteStatus();
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error.response?.data || error.message);
    // Refresh status on error
    await checkFavoriteStatus();
  } finally {
    setLoading(false);
  }
};

  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !isAuthenticated}
      className={`inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all duration-200 hover:shadow-md ${
        isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Bookmark className={sizeClasses[size]} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
};

export default FavoriteButton;