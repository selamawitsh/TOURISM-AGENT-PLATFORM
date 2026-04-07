package dto

import (
    "time"
    "github.com/google/uuid"
)

// RegisterRequest - What client sends to create an account
type RegisterRequest struct {
    FirstName string `json:"first_name" binding:"required,min=2,max=100"`
    LastName  string `json:"last_name" binding:"required,min=2,max=100"`
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=8"`
    Phone     string `json:"phone" binding:"omitempty"`
}

// LoginRequest - What client sends to authenticate
type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

// RefreshTokenRequest - What client sends to get new access token
type RefreshTokenRequest struct {
    RefreshToken string `json:"refresh_token" binding:"required"`
}

// AuthResponse - What client receives after successful auth
type AuthResponse struct {
    AccessToken  string      `json:"access_token"`
    RefreshToken string      `json:"refresh_token"`
    User         UserResponse `json:"user"`
}

// UserResponse - User data sent to client (excludes sensitive fields)
type UserResponse struct {
    ID              uuid.UUID `json:"id"`
    FirstName       string    `json:"first_name"`
    LastName        string    `json:"last_name"`
    Email           string    `json:"email"`
    Role            string    `json:"role"`
    IsEmailVerified bool      `json:"is_email_verified"`
    IsActive        bool      `json:"is_active"`
    LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
}

// ErrorResponse - Standard error format
type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message,omitempty"`
    Code    int    `json:"code,omitempty"`
}

// SuccessResponse - Standard success format
type SuccessResponse struct {
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}