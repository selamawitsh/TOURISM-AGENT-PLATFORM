package service

import (
	"errors"
	"time"

	"auth-service/internal/config"
	"auth-service/internal/dto"
	"auth-service/internal/models"
	"auth-service/internal/repository"
	"auth-service/internal/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	Repo *repository.AuthRepository
	Cfg  *config.Config
}

func NewAuthService(repo *repository.AuthRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		Repo: repo,
		Cfg:  cfg,
	}
}

// Register creates a new user account
func (s *AuthService) Register(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Check if user already exists
	_, err := s.Repo.GetUserByEmail(req.Email)
	if err == nil {
		return nil, errors.New("email already exists")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user model (no phone field - removed)
	user := &models.User{
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		Email:           req.Email,
		PasswordHash:    hashedPassword,
		Role:            models.RoleCustomer,
		IsActive:        true,
		IsEmailVerified: false,
	}

	// Save user to database
	if err := s.Repo.CreateUser(user); err != nil {
		return nil, err
	}

	// Generate access token
	accessToken, err := utils.GenerateAccessToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, err := utils.GenerateRefreshToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Calculate refresh token expiry (from config, in hours)
	refreshExpiry := time.Duration(s.Cfg.JWTRefreshTokenExpiresHour) * time.Hour

	// Save refresh token to database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
			ExpiresAt: time.Now().Add(refreshExpiry),
		IsRevoked: false,
	}

	if err := s.Repo.SaveRefreshToken(refreshTokenRecord); err != nil {
		return nil, err
	}

	// Return response with typed DTO
	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			Email:           user.Email,
			Role:            string(user.Role),
			IsActive:        user.IsActive,
			IsEmailVerified: user.IsEmailVerified,
			CreatedAt:       user.CreatedAt,
			UpdatedAt:       user.UpdatedAt,
		},
	}, nil
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	// Find user by email
	user, err := s.Repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	// Check if account is active
	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	// Update last login time
	_ = s.Repo.UpdateLastLogin(user.ID)

	// Generate access token
	accessToken, err := utils.GenerateAccessToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, err := utils.GenerateRefreshToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Calculate refresh token expiry (from config, in hours)
	refreshExpiry := time.Duration(s.Cfg.JWTRefreshTokenExpiresHour) * time.Hour

	// Save refresh token to database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(refreshExpiry),
		IsRevoked: false,
	}

	if err := s.Repo.SaveRefreshToken(refreshTokenRecord); err != nil {
		return nil, err
	}

	// Return response with typed DTO
	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			Email:           user.Email,
			Role:            string(user.Role),
			IsActive:        user.IsActive,
			IsEmailVerified: user.IsEmailVerified,
			LastLoginAt:     user.LastLoginAt,
			CreatedAt:       user.CreatedAt,
			UpdatedAt:       user.UpdatedAt,
		},
	}, nil
}

// Logout revokes a refresh token
func (s *AuthService) Logout(refreshToken string) error {
	return s.Repo.RevokeRefreshToken(refreshToken)
}

// RefreshAccessToken generates a new access token using a refresh token
func (s *AuthService) RefreshAccessToken(refreshTokenString string) (*dto.AuthResponse, error) {
	// Get refresh token from database
	refreshToken, err := s.Repo.GetRefreshToken(refreshTokenString)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if token is expired
	if time.Now().After(refreshToken.ExpiresAt) {
		return nil, errors.New("refresh token expired")
	}

	// Check if token is revoked
	if refreshToken.IsRevoked {
		return nil, errors.New("refresh token revoked")
	}

	// Get the user
	user, err := s.Repo.GetUserByID(refreshToken.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	// Generate new access token
	accessToken, err := utils.GenerateAccessToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Return new access token (no new refresh token)
	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenString, // Keep the same refresh token
		User: dto.UserResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			Email:           user.Email,
			Role:            string(user.Role),
			IsActive:        user.IsActive,
			IsEmailVerified: user.IsEmailVerified,
			CreatedAt:       user.CreatedAt,
			UpdatedAt:       user.UpdatedAt,
		},
	}, nil
}