package utils

import (
	"fmt"
	"time"

	"auth-service/internal/config"
	"auth-service/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// CustomClaims - What information is stored in the JWT token
type CustomClaims struct {
    UserID string          `json:"user_id"`  
    Email  string          `json:"email"`
    Role   models.UserRole `json:"role"`
    jwt.RegisteredClaims
}

// GenerateAccessToken creates a short-lived JWT token for API access
func GenerateAccessToken(user *models.User, cfg *config.Config) (string, error) {
    expiresIn := time.Duration(cfg.JWTAccessTokenExpiresMin) * time.Minute

    claims := CustomClaims{
        UserID: user.ID.String(),  
        Email:  user.Email,
        Role:   user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Subject:   user.ID.String(), 
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(cfg.JWTSecret))
}

// GenerateRefreshToken creates a long-lived token for obtaining new access tokens
func GenerateRefreshToken(user *models.User, cfg *config.Config) (string, error) {
    expiresIn := time.Duration(cfg.JWTRefreshTokenExpiresHour) * time.Hour

    claims := jwt.RegisteredClaims{
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
        IssuedAt:  jwt.NewNumericDate(time.Now()),
        Subject:   user.ID.String(),  // Store UUID as string
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(cfg.JWTSecret))
}

// ValidateToken verifies a JWT token and returns the claims
func ValidateToken(tokenString string, cfg *config.Config) (*CustomClaims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
        return []byte(cfg.JWTSecret), nil
    })

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*CustomClaims)
    if !ok || !token.Valid {
        return nil, fmt.Errorf("invalid token")
    }

    return claims, nil
}

// ParseUserIDFromToken extracts the user ID from a validated token
func ParseUserIDFromToken(claims *CustomClaims) (uuid.UUID, error) {
    return uuid.Parse(claims.UserID)
}