package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"log"
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

// generateRandomToken creates a secure random token
func generateRandomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// sendVerificationEmail sends email verification link
func (s *AuthService) sendVerificationEmail(to, token string) {
	frontendURL := s.Cfg.FrontendURL
	err := s.SendVerificationEmail(to, token, frontendURL)
	if err != nil {
		log.Printf("Failed to send verification email to %s: %v", to, err)
	}
}

// sendPasswordResetEmail sends password reset email
func (s *AuthService) sendPasswordResetEmail(to, token string) {
	frontendURL := s.Cfg.FrontendURL
	err := s.SendPasswordResetEmail(to, token, frontendURL)
	if err != nil {
		log.Printf("Failed to send password reset email to %s: %v", to, err)
	} else {
		log.Printf("✅ Password reset email sent to %s", to)
	}
}

// Register creates a new user account and sends verification email
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

	// Create user model (email not verified yet)
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

	// Generate email verification token
	token, err := generateRandomToken()
	if err != nil {
		return nil, err
	}

	// Save token to database
	verificationToken := &models.EmailVerificationToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		IsUsed:    false,
	}

	if err := s.Repo.SaveEmailVerificationToken(verificationToken); err != nil {
		return nil, err
	}

	// Send verification email (asynchronously)
	go s.sendVerificationEmail(user.Email, token)

	// Return response without tokens (user must verify email first)
	return &dto.AuthResponse{
		AccessToken:  "",
		RefreshToken: "",
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
		Message: "Registration successful! Please check your email to verify your account.",
	}, nil
}

// VerifyEmail confirms a user's email address
func (s *AuthService) VerifyEmail(token string) (*dto.AuthResponse, error) {
	// Find valid token
	verificationToken, err := s.Repo.GetEmailVerificationToken(token)
	if err != nil {
		return nil, errors.New("invalid or expired verification token")
	}

	// Mark token as used
	if err := s.Repo.MarkEmailVerificationTokenAsUsed(verificationToken.ID); err != nil {
		return nil, err
	}

	// Verify user's email
	if err := s.Repo.VerifyUserEmail(verificationToken.UserID); err != nil {
		return nil, err
	}

	// Get user
	user, err := s.Repo.GetUserByID(verificationToken.UserID)
	if err != nil {
		return nil, err
	}

	// Generate tokens now that email is verified
	accessToken, err := utils.GenerateAccessToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user, s.Cfg)
	if err != nil {
		return nil, err
	}

	// Save refresh token
	refreshExpiry := time.Duration(s.Cfg.JWTRefreshTokenExpiresHour) * time.Hour
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(refreshExpiry),
		IsRevoked: false,
	}
	s.Repo.SaveRefreshToken(refreshTokenRecord)

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
		Message: "Email verified successfully! You are now logged in.",
	}, nil
}

// ResendVerificationEmail sends a new verification email
func (s *AuthService) ResendVerificationEmail(email string) error {
	user, err := s.Repo.GetUserByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	if user.IsEmailVerified {
		return errors.New("email already verified")
	}

	// Generate new token
	token, err := generateRandomToken()
	if err != nil {
		return err
	}

	// Save token
	verificationToken := &models.EmailVerificationToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		IsUsed:    false,
	}
	if err := s.Repo.SaveEmailVerificationToken(verificationToken); err != nil {
		return err
	}

	// Send email
	go s.sendVerificationEmail(user.Email, token)

	return nil
}

// Login authenticates a user and returns tokens (requires verified email)
func (s *AuthService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	// Find user by email
	user, err := s.Repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check if email is verified
	if !user.IsEmailVerified {
		return nil, errors.New("please verify your email before logging in")
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

	// Return new access token (keep the same refresh token)
	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenString,
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

// ForgotPassword generates a password reset token and sends email
func (s *AuthService) ForgotPassword(email string) error {
	// Find user by email
	user, err := s.Repo.GetUserByEmail(email)
	if err != nil {
		// Don't reveal if email exists or not (security best practice)
		return nil
	}

	// Generate reset token
	token, err := generateRandomToken()
	if err != nil {
		return err
	}

	// Save token to database
	resetToken := &models.PasswordResetToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour), // 1 hour expiry
		IsUsed:    false,
	}

	if err := s.Repo.SavePasswordResetToken(resetToken); err != nil {
		return err
	}

	// Send password reset email
	go s.sendPasswordResetEmail(user.Email, token)

	return nil
}

// ResetPassword validates token and updates password
func (s *AuthService) ResetPassword(token, newPassword string) error {
	// Find valid token
	resetToken, err := s.Repo.GetPasswordResetToken(token)
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	// Mark token as used
	if err := s.Repo.MarkPasswordResetTokenAsUsed(resetToken.ID); err != nil {
		return err
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Update user's password
	if err := s.Repo.UpdatePassword(resetToken.UserID, hashedPassword); err != nil {
		return err
	}

	return nil
}