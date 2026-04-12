package repository

import (
	"destination-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DestinationRepository struct {
	DB *gorm.DB
}

func NewDestinationRepository(db *gorm.DB) *DestinationRepository {
	return &DestinationRepository{DB: db}
}

// Category operations
func (r *DestinationRepository) CreateCategory(category *models.Category) error {
	return r.DB.Create(category).Error
}

func (r *DestinationRepository) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := r.DB.Find(&categories).Error
	return categories, err
}

func (r *DestinationRepository) GetCategoryByID(id uuid.UUID) (*models.Category, error) {
	var category models.Category
	err := r.DB.First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *DestinationRepository) UpdateCategory(category *models.Category) error {
	return r.DB.Save(category).Error
}

func (r *DestinationRepository) DeleteCategory(id uuid.UUID) error {
	return r.DB.Delete(&models.Category{}, "id = ?", id).Error
}

// Destination operations
func (r *DestinationRepository) CreateDestination(destination *models.Destination) error {
	return r.DB.Create(destination).Error
}

func (r *DestinationRepository) GetDestinationByID(id uuid.UUID) (*models.Destination, error) {
	var destination models.Destination
	err := r.DB.Preload("Category").First(&destination, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &destination, nil
}

func (r *DestinationRepository) GetDestinationBySlug(slug string) (*models.Destination, error) {
	var destination models.Destination
	err := r.DB.Preload("Category").First(&destination, "slug = ?", slug).Error
	if err != nil {
		return nil, err
	}
	return &destination, nil
}

func (r *DestinationRepository) GetAllDestinations(limit, offset int) ([]models.Destination, int64, error) {
	var destinations []models.Destination
	var total int64

	r.DB.Model(&models.Destination{}).Count(&total)
	err := r.DB.Preload("Category").Limit(limit).Offset(offset).Order("created_at DESC").Find(&destinations).Error
	return destinations, total, err
}

func (r *DestinationRepository) GetFeaturedDestinations(limit int) ([]models.Destination, error) {
	var destinations []models.Destination
	err := r.DB.Preload("Category").Where("is_featured = ? AND is_active = ?", true, true).
		Limit(limit).Order("rating DESC").Find(&destinations).Error
	return destinations, err
}

func (r *DestinationRepository) UpdateDestination(destination *models.Destination) error {
	return r.DB.Save(destination).Error
}

func (r *DestinationRepository) DeleteDestination(id uuid.UUID) error {
	return r.DB.Delete(&models.Destination{}, "id = ?", id).Error
}

func (r *DestinationRepository) IncrementViewCount(id uuid.UUID) error {
	return r.DB.Model(&models.Destination{}).Where("id = ?", id).
		Update("view_count", gorm.Expr("view_count + 1")).Error
}

// Destination Image operations
func (r *DestinationRepository) AddDestinationImage(image *models.DestinationImage) error {
	return r.DB.Create(image).Error
}

func (r *DestinationRepository) GetDestinationImages(destinationID uuid.UUID) ([]models.DestinationImage, error) {
	var images []models.DestinationImage
	err := r.DB.Where("destination_id = ?", destinationID).Order("order ASC").Find(&images).Error
	return images, err
}

func (r *DestinationRepository) DeleteDestinationImage(id uuid.UUID) error {
	return r.DB.Delete(&models.DestinationImage{}, "id = ?", id).Error
}