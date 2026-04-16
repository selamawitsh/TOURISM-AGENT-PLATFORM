package dto

import (
	"time"

)

// CreateReviewRequest - What client sends to create a review
type CreateReviewRequest struct {
	DestinationID string   `json:"destination_id" binding:"required"`
	BookingID     string   `json:"booking_id,omitempty"`
	Rating        int      `json:"rating" binding:"required,min=1,max=5"`
	Title         string   `json:"title" binding:"max=200"`
	Comment       string   `json:"comment" binding:"required"`
	Images        []string `json:"images,omitempty"`
}

// UpdateReviewRequest - What client sends to update a review
type UpdateReviewRequest struct {
	Rating  *int     `json:"rating,omitempty" binding:"omitempty,min=1,max=5"`
	Title   *string  `json:"title,omitempty"`
	Comment *string  `json:"comment,omitempty"`
	Images  []string `json:"images,omitempty"`
}

// ReviewResponse - What client receives
type ReviewResponse struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	UserName        string    `json:"user_name"`
	UserAvatar      string    `json:"user_avatar,omitempty"`
	DestinationID   string    `json:"destination_id"`
	DestinationName string    `json:"destination_name"`
	BookingID       *string   `json:"booking_id,omitempty"`
	Rating          int       `json:"rating"`
	Title           string    `json:"title"`
	Comment         string    `json:"comment"`
	Images          []string  `json:"images,omitempty"`
	IsVerified      bool      `json:"is_verified"`
	IsApproved      bool      `json:"is_approved"`
	HelpfulCount    int       `json:"helpful_count"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ReviewListResponse - For listing reviews
type ReviewListResponse struct {
	Reviews       []ReviewResponse `json:"reviews"`
	Total         int64            `json:"total"`
	AverageRating float64          `json:"average_rating"`
	TotalReviews  int              `json:"total_reviews"`
}

// MarkHelpfulRequest - Mark a review as helpful
type MarkHelpfulRequest struct {
	ReviewID string `json:"review_id" binding:"required"`
}