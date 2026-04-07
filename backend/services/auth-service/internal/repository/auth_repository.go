package repository

import (
	"auth-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthRepository struct {
	DB *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{DB: db}
}

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

// Fixed: Use uuid.UUID instead of uint
func (r *AuthRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

//Use uuid.UUID instead of uint
func (r *AuthRepository) UpdateLastLogin(userID uuid.UUID) error {
	return r.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("last_login_at", gorm.Expr("NOW()")).Error
}

func (r *AuthRepository) SaveRefreshToken(token *models.RefreshToken) error {
	return r.DB.Create(token).Error
}

//Use IsRevoked field (not Revoked)
func (r *AuthRepository) GetRefreshToken(token string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken
	err := r.DB.Where("token = ? AND is_revoked = ?", token, false).First(&refreshToken).Error
	if err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

//Use IsRevoked field (not Revoked)
func (r *AuthRepository) RevokeRefreshToken(token string) error {
	return r.DB.Model(&models.RefreshToken{}).
		Where("token = ?", token).
		Update("is_revoked", true).Error
}