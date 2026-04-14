package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BookingStatus represents the status of a booking
type BookingStatus string

const (
	StatusPending   BookingStatus = "pending"
	StatusConfirmed BookingStatus = "confirmed"
	StatusCancelled BookingStatus = "cancelled"
	StatusCompleted BookingStatus = "completed"
)

// Booking represents a tour booking made by a user
type Booking struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	DestinationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"destination_id"`
	
	// Booking details
	BookingDate   time.Time      `gorm:"not null" json:"booking_date"`
	TravelDate    time.Time      `gorm:"not null;index" json:"travel_date"`
	NumberOfGuests int           `gorm:"not null" json:"number_of_guests"`
	
	// Pricing
	UnitPrice     float64        `gorm:"not null" json:"unit_price"`
	TotalPrice    float64        `gorm:"not null" json:"total_price"`
	Currency      string         `gorm:"size:3;default:'USD'" json:"currency"`
	
	// Status
	Status        BookingStatus  `gorm:"size:20;default:'pending'" json:"status"`
	
	// Contact info at booking time (snapshot)
	ContactName   string         `gorm:"size:200;not null" json:"contact_name"`
	ContactEmail  string         `gorm:"size:255;not null" json:"contact_email"`
	ContactPhone  string         `gorm:"size:20" json:"contact_phone"`
	
	// Special requests
	SpecialRequests string        `gorm:"type:text" json:"special_requests"`
	
	// Timestamps
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relations (not stored in DB, populated on query)
	User          interface{}    `gorm:"-" json:"user,omitempty"`
	Destination   interface{}    `gorm:"-" json:"destination,omitempty"`
}

// TableName specifies the table name
func (Booking) TableName() string {
	return "bookings"
}

// BeforeCreate hook for UUID generation
func (b *Booking) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}