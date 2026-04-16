package repository

import (
	"review-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewRepository struct {
	DB *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{DB: db}
}

// Create adds a new review
func (r *ReviewRepository) Create(review *models.Review) error {
	return r.DB.Create(review).Error
}

// FindByID finds a review by ID
func (r *ReviewRepository) FindByID(id uuid.UUID) (*models.Review, error) {
	var review models.Review
	err := r.DB.First(&review, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

// FindByDestinationID finds all reviews for a destination
func (r *ReviewRepository) FindByDestinationID(destinationID uuid.UUID, limit, offset int) ([]models.Review, int64, error) {
	var reviews []models.Review
	var total int64

	query := r.DB.Model(&models.Review{}).Where("destination_id = ? AND is_approved = ?", destinationID, true)
	query.Count(&total)

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&reviews).Error
	return reviews, total, err
}

// FindByUserID finds all reviews by a user
func (r *ReviewRepository) FindByUserID(userID uuid.UUID) ([]models.Review, error) {
	var reviews []models.Review
	err := r.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

// FindByUserAndDestination checks if user already reviewed this destination
func (r *ReviewRepository) FindByUserAndDestination(userID, destinationID uuid.UUID) (*models.Review, error) {
	var review models.Review
	err := r.DB.Where("user_id = ? AND destination_id = ?", userID, destinationID).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

// Update updates a review
func (r *ReviewRepository) Update(review *models.Review) error {
	return r.DB.Save(review).Error
}

// Delete soft-deletes a review
func (r *ReviewRepository) Delete(id uuid.UUID) error {
	return r.DB.Delete(&models.Review{}, "id = ?", id).Error
}

// UpdateHelpfulCount increments helpful count
func (r *ReviewRepository) UpdateHelpfulCount(id uuid.UUID) error {
	return r.DB.Model(&models.Review{}).Where("id = ?", id).
		Update("helpful_count", gorm.Expr("helpful_count + 1")).Error
}

