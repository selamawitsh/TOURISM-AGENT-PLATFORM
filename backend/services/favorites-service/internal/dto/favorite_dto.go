package dto

import (
	"time"
)

// AddFavoriteRequest - What client sends to add a favorite
type AddFavoriteRequest struct {
	DestinationID string `json:"destination_id" binding:"required"`
}

// FavoriteResponse - What client receives
type FavoriteResponse struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	DestinationID   string    `json:"destination_id"`
	DestinationName string    `json:"destination_name"`
	DestinationCity string    `json:"destination_city"`
	DestinationCountry string `json:"destination_country"`
	DestinationImage string   `json:"destination_image"`
	DestinationPrice float64  `json:"destination_price"`
	CreatedAt       time.Time `json:"created_at"`
}

// FavoritesListResponse - For listing favorites
type FavoritesListResponse struct {
	Favorites []FavoriteResponse `json:"favorites"`
	Total     int64              `json:"total"`
}

// FavoriteCheckResponse - Check if destination is favorite
type FavoriteCheckResponse struct {
	IsFavorite bool `json:"is_favorite"`
}