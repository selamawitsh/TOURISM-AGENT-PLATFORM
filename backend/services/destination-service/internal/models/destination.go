package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/datatypes"
)

// Category represents a destination category
type Category struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"size:100;uniqueIndex;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Icon        string         `gorm:"size:50" json:"icon"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Destination represents a travel destination
type Destination struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name             string         `gorm:"size:200;not null;index" json:"name"`
	Slug             string         `gorm:"size:200;uniqueIndex;not null" json:"slug"`
	ShortDescription string         `gorm:"size:500" json:"short_description"`
	Description      string         `gorm:"type:text" json:"description"`
	Country          string         `gorm:"size:100;not null;index" json:"country"`
	City             string         `gorm:"size:100;index" json:"city"`
	Address          string         `gorm:"size:255" json:"address"`
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
	
	// Pricing
	PricePerPerson   float64        `gorm:"not null" json:"price_per_person"`
	DiscountPrice    float64        `json:"discount_price"`
	
	// Tour details
	Duration         int            `gorm:"not null" json:"duration"`
	MaxPeople        int            `gorm:"default:20" json:"max_people"`
	Difficulty       string         `gorm:"size:20;default:'easy'" json:"difficulty"`
	
	// Features
	CategoryID       *uuid.UUID     `gorm:"type:uuid;index" json:"category_id"`
	Category         *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Included         datatypes.JSON `gorm:"type:jsonb" json:"included"`
	Excluded         datatypes.JSON `gorm:"type:jsonb" json:"excluded"`
	
	// Media
	MainImage        string         `gorm:"size:500" json:"main_image"`
	
	// Status
	IsActive         bool           `gorm:"default:true" json:"is_active"`
	IsFeatured       bool           `gorm:"default:false" json:"is_featured"`
	
	// Statistics
	ViewCount        int            `gorm:"default:0" json:"view_count"`
	BookingCount     int            `gorm:"default:0" json:"booking_count"`
	Rating           float32        `gorm:"default:0" json:"rating"`
	ReviewCount      int            `gorm:"default:0" json:"review_count"`
	
	// Timestamps
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// DestinationImage represents multiple images for a destination
type DestinationImage struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	DestinationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"destination_id"`
	ImageURL      string         `gorm:"size:500;not null" json:"image_url"`
	Caption       string         `gorm:"size:255" json:"caption"`
	IsPrimary     bool           `gorm:"default:false" json:"is_primary"`
	Order         int            `gorm:"default:0" json:"order"`
	CreatedAt     time.Time      `json:"created_at"`
	
	Destination   Destination    `gorm:"foreignKey:DestinationID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Category) TableName() string {
	return "categories"
}

func (Destination) TableName() string {
	return "destinations"
}

func (DestinationImage) TableName() string {
	return "destination_images"
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (d *Destination) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

func (di *DestinationImage) BeforeCreate(tx *gorm.DB) error {
	if di.ID == uuid.Nil {
		di.ID = uuid.New()
	}
	return nil
}