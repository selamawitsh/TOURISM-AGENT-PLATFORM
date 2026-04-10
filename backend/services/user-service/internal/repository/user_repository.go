package repository

import (
	"user-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRepository handles database operations for users
type UserRepository struct {
	DB *gorm.DB
}

// NewUserRepository creates a new repository instance
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// Create creates a new user in the database
func (r *UserRepository) Create(user *models.User) error {
	return r.DB.Create(user).Error
}

// FindByID finds a user by their UUID
func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.DB.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds a user by their email address
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates a user's information
func (r *UserRepository) Update(user *models.User) error {
	return r.DB.Save(user).Error
}

// FindAll finds all users with pagination
func (r *UserRepository) FindAll(limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Count total records
	r.DB.Model(&models.User{}).Count(&total)

	// Get paginated results
	err := r.DB.Limit(limit).Offset(offset).Order("created_at DESC").Find(&users).Error
	return users, total, err
}

// UpdateRole updates a user's role
func (r *UserRepository) UpdateRole(userID uuid.UUID, role models.UserRole) error {
	return r.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("role", role).Error
}

// Delete soft-deletes a user
func (r *UserRepository) Delete(userID uuid.UUID) error {
	return r.DB.Delete(&models.User{}, "id = ?", userID).Error
}