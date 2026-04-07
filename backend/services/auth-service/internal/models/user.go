package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleCustomer UserRole = "customer"
	RoleAgent    UserRole = "agent"
	RoleAdmin    UserRole = "admin"
)

type User struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	FirstName       string         `gorm:"size:100;not null" json:"first_name"`
	LastName        string         `gorm:"size:100;not null" json:"last_name"`
	Email           string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash    string         `gorm:"not null" json:"-"`
	Role            UserRole       `gorm:"type:varchar(20);default:'customer'" json:"role"`
	IsEmailVerified bool           `gorm:"default:false" json:"is_email_verified"`
	IsActive        bool           `gorm:"default:true" json:"is_active"`
	LastLoginAt     *time.Time     `json:"last_login_at"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}