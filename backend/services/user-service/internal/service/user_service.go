package service

import (
	"errors"

	"user-service/internal/dto"
	"user-service/internal/models"
	"user-service/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserService handles user-related business logic
type UserService struct {
	Repo *repository.UserRepository
}

// NewUserService creates a new service instance
func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

// GetProfile returns a user's profile
func (s *UserService) GetProfile(userID uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.Repo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return s.toUserResponse(user), nil
}

// UpdateProfile updates a user's profile information
func (s *UserService) UpdateProfile(userID uuid.UUID, req dto.UpdateProfileRequest) (*dto.UserResponse, error) {
	user, err := s.Repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Update only the fields that were provided
	// This uses pointers to distinguish between "not provided" and "empty value"
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Phone != nil {
		user.Phone = req.Phone
	}
	if req.DateOfBirth != nil {
		user.DateOfBirth = req.DateOfBirth
	}
	if req.Bio != nil {
		user.Bio = req.Bio
	}
	if req.Country != nil {
		user.Country = req.Country
	}
	if req.City != nil {
		user.City = req.City
	}
	if req.Address != nil {
		user.Address = req.Address
	}
	if req.PostalCode != nil {
		user.PostalCode = req.PostalCode
	}
	if req.Language != nil {
		user.Language = req.Language
	}
	if req.Currency != nil {
		user.Currency = req.Currency
	}
	if req.Timezone != nil {
		user.Timezone = req.Timezone
	}

	// Save changes to database
	if err := s.Repo.Update(user); err != nil {
		return nil, err
	}

	return s.toUserResponse(user), nil
}

// GetUserByID returns any user (admin only)
func (s *UserService) GetUserByID(userID uuid.UUID) (*dto.AdminUserResponse, error) {
	user, err := s.Repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return &dto.AdminUserResponse{
		UserResponse: *s.toUserResponse(user),
	}, nil
}

// ListAllUsers returns all users with pagination (admin only)
func (s *UserService) ListAllUsers(page, pageSize int) ([]dto.UserResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	users, total, err := s.Repo.FindAll(pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.UserResponse, len(users))
	for i, user := range users {
		responses[i] = *s.toUserResponse(&user)
	}

	return responses, total, nil
}

// UpdateUserRole updates a user's role (admin only)
func (s *UserService) UpdateUserRole(userID uuid.UUID, role string) error {
	// Validate role
	validRoles := map[string]models.UserRole{
		"customer": models.RoleCustomer,
		"agent":    models.RoleAgent,
		"admin":    models.RoleAdmin,
	}

	newRole, ok := validRoles[role]
	if !ok {
		return errors.New("invalid role")
	}

	return s.Repo.UpdateRole(userID, newRole)
}

// DeleteUser soft-deletes a user (admin only)
func (s *UserService) DeleteUser(userID uuid.UUID) error {
	return s.Repo.Delete(userID)
}

// toUserResponse converts a User model to a UserResponse DTO
// This hides sensitive information like password hash
func (s *UserService) toUserResponse(user *models.User) *dto.UserResponse {
	return &dto.UserResponse{
		ID:              user.ID,
		FirstName:       user.FirstName,
		LastName:        user.LastName,
		Email:           user.Email,
		Role:            string(user.Role),
		Phone:           user.Phone,
		Avatar:          user.Avatar,
		DateOfBirth:     user.DateOfBirth,
		Bio:             user.Bio,
		Country:         user.Country,
		City:            user.City,
		Language:        user.Language,
		Currency:        user.Currency,
		IsActive:        user.IsActive,
		IsEmailVerified: user.IsEmailVerified,
		BookingsCount:   user.BookingsCount,
		ReviewsCount:    user.ReviewsCount,
		AverageRating:   user.AverageRating,
		CreatedAt:       user.CreatedAt,
		LastLoginAt:     user.LastLoginAt,
	}
}