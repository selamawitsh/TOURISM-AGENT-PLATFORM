package repository

import (
	"errors"

	"favorites-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FavoriteRepository struct {
	DB *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) *FavoriteRepository {
	return &FavoriteRepository{DB: db}
}

// Create adds a new favorite
func (r *FavoriteRepository) Create(favorite *models.Favorite) error {
	return r.DB.Create(favorite).Error
}

// Delete removes a favorite (hard delete)
func (r *FavoriteRepository) Delete(userID, destinationID uuid.UUID) error {
	// Use Unscoped for hard delete (permanently removes the record)
	result := r.DB.Unscoped().Where("user_id = ? AND destination_id = ?", userID, destinationID).Delete(&models.Favorite{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("no favorite found to delete")
	}
	return nil
}

// FindByUserID finds all favorites for a user
func (r *FavoriteRepository) FindByUserID(userID uuid.UUID) ([]models.Favorite, error) {
	var favorites []models.Favorite
	err := r.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&favorites).Error
	return favorites, err
}

// Exists checks if a favorite exists (using raw query to avoid caching)
func (r *FavoriteRepository) Exists(userID, destinationID uuid.UUID) bool {
	var count int64
	r.DB.Model(&models.Favorite{}).Unscoped().Where("user_id = ? AND destination_id = ?", userID, destinationID).Count(&count)
	return count > 0
}

// FindByUserAndDestination finds a favorite by user and destination
func (r *FavoriteRepository) FindByUserAndDestination(userID, destinationID uuid.UUID) (*models.Favorite, error) {
	var favorite models.Favorite
	err := r.DB.Unscoped().Where("user_id = ? AND destination_id = ?", userID, destinationID).First(&favorite).Error
	if err != nil {
		return nil, err
	}
	return &favorite, nil
}