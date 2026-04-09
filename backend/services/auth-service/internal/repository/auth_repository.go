package repository

import (
	"auth-service/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthRepository struct {
	DB *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{DB: db}
}

// User related methods
func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.DB.Create(user).Error
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) UpdateLastLogin(userID uuid.UUID) error {
	return r.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("last_login_at", gorm.Expr("NOW()")).Error
}

func (r *AuthRepository) VerifyUserEmail(userID uuid.UUID) error {
	return r.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("is_email_verified", true).Error
}

// Refresh Token related methods
func (r *AuthRepository) SaveRefreshToken(token *models.RefreshToken) error {
	return r.DB.Create(token).Error
}

func (r *AuthRepository) GetRefreshToken(token string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken
	err := r.DB.Where("token = ? AND is_revoked = ?", token, false).First(&refreshToken).Error
	if err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

func (r *AuthRepository) RevokeRefreshToken(token string) error {
	return r.DB.Model(&models.RefreshToken{}).
		Where("token = ?", token).
		Update("is_revoked", true).Error
}

// Email Verification Token related methods
func (r *AuthRepository) SaveEmailVerificationToken(token *models.EmailVerificationToken) error {
	return r.DB.Create(token).Error
}

func (r *AuthRepository) GetEmailVerificationToken(token string) (*models.EmailVerificationToken, error) {
	var verificationToken models.EmailVerificationToken
	err := r.DB.Where("token = ? AND is_used = ? AND expires_at > ?", token, false, time.Now()).
		First(&verificationToken).Error
	if err != nil {
		return nil, err
	}
	return &verificationToken, nil
}

func (r *AuthRepository) MarkEmailVerificationTokenAsUsed(tokenID uuid.UUID) error {
	return r.DB.Model(&models.EmailVerificationToken{}).
		Where("id = ?", tokenID).
		Update("is_used", true).Error
}