package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"user-service/internal/dto"
	"user-service/internal/models"
	"user-service/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserService handles user-related business logic
type UserService struct {
	Repo           *repository.UserRepository
	AuthServiceURL string
}

// NewUserService creates a new service instance
func NewUserService(repo *repository.UserRepository, authServiceURL string) *UserService {
	return &UserService{
		Repo:           repo,
		AuthServiceURL: authServiceURL,
	}
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

// CreateUser creates a new user by calling Auth Service API (admin only)
func (s *UserService) CreateUser(req dto.CreateUserRequest) (*dto.CreateUserResponse, error) {
	// Check if user already exists in local DB
	existing, _ := s.Repo.FindByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Call Auth Service to create the user (handles password hashing)
	authReq := map[string]interface{}{
		"first_name": req.FirstName,
		"last_name":  req.LastName,
		"email":      req.Email,
		"password":   req.Password,
	}

	jsonData, err := json.Marshal(authReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Call Auth Service register endpoint
	url := fmt.Sprintf("%s/api/v1/auth/register", s.AuthServiceURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to call auth service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("auth service returned error: %d", resp.StatusCode)
	}

	// Parse response to get user ID
	var authResp struct {
		User struct {
			ID uuid.UUID `json:"id"`
		} `json:"user"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, fmt.Errorf("failed to parse auth service response: %w", err)
	}

	// Now update the user's role in local DB (since auth service creates as customer)
	user, err := s.Repo.FindByID(authResp.User.ID)
	if err != nil {
		return nil, fmt.Errorf("user created but failed to find: %w", err)
	}

	// Update role and additional fields
	user.Role = models.UserRole(req.Role)
	if req.Phone != "" {
		user.Phone = &req.Phone
	}

	if err := s.Repo.Update(user); err != nil {
		return nil, fmt.Errorf("user created but failed to update role: %w", err)
	}

	return &dto.CreateUserResponse{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		Role:      string(user.Role),
		CreatedAt: user.CreatedAt,
		Message:   "User created successfully. They can now login with their credentials.",
	}, nil
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
		return errors.New("invalid role. Must be one of: customer, agent, admin")
	}

	return s.Repo.UpdateRole(userID, newRole)
}

// DeleteUser soft-deletes a user (admin only)
func (s *UserService) DeleteUser(userID uuid.UUID) error {
	return s.Repo.Delete(userID)
}

// toUserResponse converts a User model to a UserResponse DTO
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