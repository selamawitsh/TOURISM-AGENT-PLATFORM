package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Favorite represents a user's favorite destination
type Favorite struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index:idx_user_destination,unique" json:"user_id"`
	DestinationID uuid.UUID      `gorm:"type:uuid;not null;index:idx_user_destination,unique" json:"destination_id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name
func (Favorite) TableName() string {
	return "favorites"
}

// BeforeCreate hook for UUID generation
func (f *Favorite) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}