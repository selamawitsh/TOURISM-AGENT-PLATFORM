package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PasswordResetToken struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Token     string         `gorm:"type:text;not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	IsUsed    bool           `gorm:"default:false" json:"is_used"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;"`
}

func (prt *PasswordResetToken) BeforeCreate(tx *gorm.DB) (err error) {
	if prt.ID == uuid.Nil {
		prt.ID = uuid.New()
	}
	return
}