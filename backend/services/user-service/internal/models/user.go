package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole defines what type of user this is
type UserRole string

const (
	RoleCustomer UserRole = "customer" // Regular traveler
	RoleAgent    UserRole = "agent"    // Travel agent who books tours
	RoleAdmin    UserRole = "admin"    // System administrator
)

// User represents a person using the platform
type User struct {
	// Basic identification (same as auth service)
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FirstName string    `gorm:"size:100;not null" json:"first_name"`
	LastName  string    `gorm:"size:100;not null" json:"last_name"`
	Email     string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Role      UserRole  `gorm:"type:varchar(20);default:'customer'" json:"role"`

	// Contact information
	Phone *string `gorm:"size:20" json:"phone,omitempty"`

	// Profile information (new for user service)
	Avatar      *string    `gorm:"size:500" json:"avatar,omitempty"`      // URL to profile picture
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`               // User's birthday
	Bio         *string    `gorm:"type:text" json:"bio,omitempty"`        // Short description about user

	// Address information
	Country     *string `gorm:"size:100" json:"country,omitempty"`
	City        *string `gorm:"size:100" json:"city,omitempty"`
	Address     *string `gorm:"size:255" json:"address,omitempty"`
	PostalCode  *string `gorm:"size:20" json:"postal_code,omitempty"`

	// Preferences
	Language *string `gorm:"size:10;default:'en'" json:"language,omitempty"`  // en, es, fr, etc.
	Currency *string `gorm:"size:3;default:'USD'" json:"currency,omitempty"`   // USD, EUR, GBP
	Timezone *string `gorm:"size:50;default:'UTC'" json:"timezone,omitempty"`  // America/New_York, etc.

	// Account status (synced with auth service)
	IsActive        bool       `gorm:"default:true" json:"is_active"`
	IsEmailVerified bool       `gorm:"default:false" json:"is_email_verified"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`

	// Statistics
	BookingsCount int     `gorm:"default:0" json:"bookings_count"`
	ReviewsCount  int     `gorm:"default:0" json:"reviews_count"`
	AverageRating float32 `gorm:"default:0" json:"average_rating"`

	// Timestamps
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the database table name
// This ensures GORM uses the correct table (same as auth service)
func (User) TableName() string {
	return "users"
}

// BeforeCreate runs automatically before saving a new user
// This generates a UUID if one doesn't exist
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}