package repository

import (
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

// Delete removes a favorite
func (r *FavoriteRepository) Delete(userID, destinationID uuid.UUID) error {
	return r.DB.Where("user_id = ? AND destination_id = ?", userID, destinationID).Delete(&models.Favorite{}).Error
}

// FindByUserID finds all favorites for a user
func (r *FavoriteRepository) FindByUserID(userID uuid.UUID) ([]models.Favorite, error) {
	var favorites []models.Favorite
	err := r.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&favorites).Error
	return favorites, err
}

// FindByUserAndDestination checks if a favorite exists
func (r *FavoriteRepository) FindByUserAndDestination(userID, destinationID uuid.UUID) (*models.Favorite, error) {
	var favorite models.Favorite
	err := r.DB.Where("user_id = ? AND destination_id = ?", userID, destinationID).First(&favorite).Error
	if err != nil {
		return nil, err
	}
	return &favorite, nil
}

// Exists checks if a favorite exists
func (r *FavoriteRepository) Exists(userID, destinationID uuid.UUID) bool {
	var count int64
	r.DB.Model(&models.Favorite{}).Where("user_id = ? AND destination_id = ?", userID, destinationID).Count(&count)
	return count > 0
}