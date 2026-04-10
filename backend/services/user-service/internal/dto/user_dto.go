package dto

import (
	"time"

	"github.com/google/uuid"
)

// UpdateProfileRequest - What client sends to update their profile
// Client can update any of these fields
type UpdateProfileRequest struct {
	FirstName   *string    `json:"first_name,omitempty"`
	LastName    *string    `json:"last_name,omitempty"`
	Phone       *string    `json:"phone,omitempty"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Bio         *string    `json:"bio,omitempty"`
	Country     *string    `json:"country,omitempty"`
	City        *string    `json:"city,omitempty"`
	Address     *string    `json:"address,omitempty"`
	PostalCode  *string    `json:"postal_code,omitempty"`
	Language    *string    `json:"language,omitempty"`
	Currency    *string    `json:"currency,omitempty"`
	Timezone    *string    `json:"timezone,omitempty"`
}

// UserResponse - What the API sends back to client (safe, no sensitive data)
type UserResponse struct {
	ID              uuid.UUID  `json:"id"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Email           string     `json:"email"`
	Role            string     `json:"role"`
	Phone           *string    `json:"phone,omitempty"`
	Avatar          *string    `json:"avatar,omitempty"`
	DateOfBirth     *time.Time `json:"date_of_birth,omitempty"`
	Bio             *string    `json:"bio,omitempty"`
	Country         *string    `json:"country,omitempty"`
	City            *string    `json:"city,omitempty"`
	Language        *string    `json:"language,omitempty"`
	Currency        *string    `json:"currency,omitempty"`
	IsActive        bool       `json:"is_active"`
	IsEmailVerified bool       `json:"is_email_verified"`
	BookingsCount   int        `json:"bookings_count"`
	ReviewsCount    int        `json:"reviews_count"`
	AverageRating   float32    `json:"average_rating"`
	CreatedAt       time.Time  `json:"created_at"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
}

// AdminUserResponse - What admin sees (full details)
type AdminUserResponse struct {
	UserResponse
	LastLoginIP *string `json:"last_login_ip,omitempty"`
	Notes       *string `json:"notes,omitempty"`
}