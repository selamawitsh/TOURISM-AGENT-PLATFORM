package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmailVerificationToken struct {
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

func (evt *EmailVerificationToken) BeforeCreate(tx *gorm.DB) (err error) {
	if evt.ID == uuid.Nil {
		evt.ID = uuid.New()
	}
	return
}