package dto

import (
	"time"

	"github.com/google/uuid"
)

// CreateDestinationRequest - Admin creates a new destination
type CreateDestinationRequest struct {
	Name             string    `json:"name" binding:"required,min=3,max=200"`
	ShortDescription string    `json:"short_description" binding:"max=500"`
	Description      string    `json:"description"`
	Country          string    `json:"country" binding:"required"`
	City             string    `json:"city"`
	Address          string    `json:"address"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	PricePerPerson   float64   `json:"price_per_person" binding:"required,min=0"`
	DiscountPrice    float64   `json:"discount_price"`
	Duration         int       `json:"duration" binding:"required,min=1"`
	MaxPeople        int       `json:"max_people"`
	Difficulty       string    `json:"difficulty"`
	CategoryID       *uuid.UUID `json:"category_id"`
	Included         []string  `json:"included"`
	Excluded         []string  `json:"excluded"`
	MainImage        string    `json:"main_image"`
	IsFeatured       bool      `json:"is_featured"`
}

// UpdateDestinationRequest - Update an existing destination
type UpdateDestinationRequest struct {
	Name             *string   `json:"name,omitempty"`
	ShortDescription *string   `json:"short_description,omitempty"`
	Description      *string   `json:"description,omitempty"`
	Country          *string   `json:"country,omitempty"`
	City             *string   `json:"city,omitempty"`
	Address          *string   `json:"address,omitempty"`
	Latitude         *float64  `json:"latitude,omitempty"`
	Longitude        *float64  `json:"longitude,omitempty"`
	PricePerPerson   *float64  `json:"price_per_person,omitempty"`
	DiscountPrice    *float64  `json:"discount_price,omitempty"`
	Duration         *int      `json:"duration,omitempty"`
	MaxPeople        *int      `json:"max_people,omitempty"`
	Difficulty       *string   `json:"difficulty,omitempty"`
	CategoryID       *uuid.UUID `json:"category_id,omitempty"`
	Included         []string  `json:"included,omitempty"`
	Excluded         []string  `json:"excluded,omitempty"`
	MainImage        *string   `json:"main_image,omitempty"`
	IsActive         *bool     `json:"is_active,omitempty"`
	IsFeatured       *bool     `json:"is_featured,omitempty"`
}

// DestinationResponse - What client receives
type DestinationResponse struct {
	ID               uuid.UUID            `json:"id"`
	Name             string               `json:"name"`
	Slug             string               `json:"slug"`
	ShortDescription string               `json:"short_description"`
	Description      string               `json:"description"`
	Country          string               `json:"country"`
	City             string               `json:"city"`
	Address          string               `json:"address"`
	Latitude         float64              `json:"latitude"`
	Longitude        float64              `json:"longitude"`
	PricePerPerson   float64              `json:"price_per_person"`
	DiscountPrice    float64              `json:"discount_price"`
	Duration         int                  `json:"duration"`
	MaxPeople        int                  `json:"max_people"`
	Difficulty       string               `json:"difficulty"`
	Category         *CategoryResponse    `json:"category,omitempty"`
	Included         []string             `json:"included"`
	Excluded         []string             `json:"excluded"`
	MainImage        string               `json:"main_image"`
	Images           []DestinationImageResponse `json:"images,omitempty"`
	IsActive         bool                 `json:"is_active"`
	IsFeatured       bool                 `json:"is_featured"`
	Rating           float32              `json:"rating"`
	ReviewCount      int                  `json:"review_count"`
	CreatedAt        time.Time            `json:"created_at"`
	UpdatedAt        time.Time            `json:"updated_at"`
}

// CategoryResponse - Category data for client
type CategoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
}

// DestinationImageResponse - Image data for client
type DestinationImageResponse struct {
	ID        uuid.UUID `json:"id"`
	ImageURL  string    `json:"image_url"`
	Caption   string    `json:"caption"`
	IsPrimary bool      `json:"is_primary"`
	Order     int       `json:"order"`
}

// CreateCategoryRequest - Admin creates a category
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

// ListDestinationsRequest - Query parameters for listing
type ListDestinationsRequest struct {
	Page       int     `form:"page,default=1"`
	PageSize   int     `form:"page_size,default=20"`
	Country    string  `form:"country"`
	CategoryID string  `form:"category_id"`
	MinPrice   float64 `form:"min_price"`
	MaxPrice   float64 `form:"max_price"`
	Duration   int     `form:"duration"`
	Search     string  `form:"search"`
	SortBy     string  `form:"sort_by"` // price, rating, duration, created_at
	SortOrder  string  `form:"sort_order"` // asc, desc
}