package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Review represents a user's review for a destination
type Review struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	DestinationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"destination_id"`
	BookingID     *uuid.UUID     `gorm:"type:uuid;index" json:"booking_id,omitempty"`
	
	// Review content
	Rating        int            `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Title         string         `gorm:"size:200" json:"title"`
	Comment       string         `gorm:"type:text" json:"comment"`
	
	// Images
	Images        []string       `gorm:"type:text[]" json:"images,omitempty"`
	
	// Status
	IsVerified    bool           `gorm:"default:false" json:"is_verified"` // User actually booked this destination
	IsApproved    bool           `gorm:"default:true" json:"is_approved"`   // Admin approved
	HelpfulCount  int            `gorm:"default:0" json:"helpful_count"`
	
	// Timestamps
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name
func (Review) TableName() string {
	return "reviews"
}

// BeforeCreate hook for UUID generation
func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}