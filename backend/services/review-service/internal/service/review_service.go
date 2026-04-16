package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"review-service/internal/config"
	"review-service/internal/dto"
	"review-service/internal/models"
	"review-service/internal/repository"

	"github.com/google/uuid"
)

type ReviewService struct {
	Repo       *repository.ReviewRepository
	Cfg        *config.Config
	HTTPClient *http.Client
}

func NewReviewService(repo *repository.ReviewRepository, cfg *config.Config) *ReviewService {
	return &ReviewService{
		Repo:       repo,
		Cfg:        cfg,
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// getUserInfo fetches user details from User Service
func (s *ReviewService) getUserInfo(userID uuid.UUID) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/users/%s", s.Cfg.UserServiceURL, userID)

	resp, err := s.HTTPClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch user info")
	}

	var user map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return user, nil
}

// getDestinationInfo fetches destination details from Destination Service
func (s *ReviewService) getDestinationInfo(destinationID uuid.UUID) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/destinations/%s", s.Cfg.DestServiceURL, destinationID)

	resp, err := s.HTTPClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch destination info")
	}

	var destination map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&destination); err != nil {
		return nil, err
	}

	return destination, nil
}

// checkUserBookedDestination verifies if user has booked this destination
func (s *ReviewService) checkUserBookedDestination(userID, destinationID uuid.UUID) (bool, string, error) {
	url := fmt.Sprintf("%s/api/v1/bookings?user_id=%s&destination_id=%s", s.Cfg.BookingServiceURL, userID, destinationID)

	resp, err := s.HTTPClient.Get(url)
	if err != nil {
		return false, "", nil // Don't block review if booking service is down
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, "", nil
	}

	var bookingsResp struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&bookingsResp); err != nil {
		return false, "", nil
	}

	if len(bookingsResp.Data) > 0 {
		return true, bookingsResp.Data[0].ID, nil
	}
	return false, "", nil
}

// CreateReview creates a new review
func (s *ReviewService) CreateReview(userID uuid.UUID, req dto.CreateReviewRequest) (*dto.ReviewResponse, error) {
	// Parse destination ID
	destID, err := uuid.Parse(req.DestinationID)
	if err != nil {
		return nil, errors.New("invalid destination ID")
	}

	// Check if user already reviewed this destination
	existing, _ := s.Repo.FindByUserAndDestination(userID, destID)
	if existing != nil {
		return nil, errors.New("you have already reviewed this destination")
	}

	// Get destination info
	destination, err := s.getDestinationInfo(destID)
	if err != nil {
		return nil, errors.New("destination not found")
	}

	// Get user info
	user, err := s.getUserInfo(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if user booked this destination (for verified badge)
	hasBooked, bookingID, _ := s.checkUserBookedDestination(userID, destID)

	var bookingIDPtr *uuid.UUID
	if hasBooked && bookingID != "" {
		if bid, err := uuid.Parse(bookingID); err == nil {
			bookingIDPtr = &bid
		}
	}

	// Parse booking ID if provided
	if req.BookingID != "" {
		if bid, err := uuid.Parse(req.BookingID); err == nil {
			bookingIDPtr = &bid
		}
	}

	// Create review
	review := &models.Review{
		UserID:        userID,
		DestinationID: destID,
		BookingID:     bookingIDPtr,
		Rating:        req.Rating,
		Title:         req.Title,
		Comment:       req.Comment,
		Images:        req.Images,
		IsVerified:    hasBooked,
		IsApproved:    true, // Auto-approve for now
	}

	if err := s.Repo.Create(review); err != nil {
		return nil, err
	}

	// Update destination rating (call Destination Service)
	go s.updateDestinationRating(destID)

	return s.toReviewResponse(review, destination, user), nil
}

// updateDestinationRating updates the average rating for a destination
func (s *ReviewService) updateDestinationRating(destinationID uuid.UUID) {
	reviews, _, err := s.Repo.FindByDestinationID(destinationID, 1000, 0)
	if err != nil {
		return
	}

	var totalRating int
	for _, review := range reviews {
		totalRating += review.Rating
	}

	avgRating := float64(totalRating) / float64(len(reviews))

	// Call Destination Service to update rating
	url := fmt.Sprintf("%s/api/v1/admin/destinations/%s/rating", s.Cfg.DestServiceURL, destinationID)

	ratingData := map[string]interface{}{
		"rating":       avgRating,
		"review_count": len(reviews),
	}

	jsonData, _ := json.Marshal(ratingData)
	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	s.HTTPClient.Do(req)
}

// GetDestinationReviews returns all reviews for a destination
func (s *ReviewService) GetDestinationReviews(destinationID string, page, pageSize int) (*dto.ReviewListResponse, error) {
	destID, err := uuid.Parse(destinationID)
	if err != nil {
		return nil, errors.New("invalid destination ID")
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	reviews, total, err := s.Repo.FindByDestinationID(destID, pageSize, offset)
	if err != nil {
		return nil, err
	}

	// Calculate average rating
	var totalRating int
	for _, review := range reviews {
		totalRating += review.Rating
	}
	avgRating := float64(totalRating) / float64(len(reviews))

	// Get destination info for name
	destination, _ := s.getDestinationInfo(destID)

	responses := make([]dto.ReviewResponse, len(reviews))
	for i, review := range reviews {
		user, _ := s.getUserInfo(review.UserID)
		responses[i] = *s.toReviewResponse(&review, destination, user)
	}

	return &dto.ReviewListResponse{
		Reviews:       responses,
		Total:         total,
		AverageRating: avgRating,
		TotalReviews:  len(reviews),
	}, nil
}

// GetMyReviews returns current user's reviews
func (s *ReviewService) GetMyReviews(userID uuid.UUID) ([]dto.ReviewResponse, error) {
	reviews, err := s.Repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]dto.ReviewResponse, len(reviews))
	for i, review := range reviews {
		destination, _ := s.getDestinationInfo(review.DestinationID)
		user, _ := s.getUserInfo(review.UserID)
		responses[i] = *s.toReviewResponse(&review, destination, user)
	}

	return responses, nil
}

// UpdateReview updates a review
func (s *ReviewService) UpdateReview(reviewID uuid.UUID, userID uuid.UUID, req dto.UpdateReviewRequest) (*dto.ReviewResponse, error) {
	review, err := s.Repo.FindByID(reviewID)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// Check ownership
	if review.UserID != userID {
		return nil, errors.New("unauthorized to update this review")
	}

	if req.Rating != nil {
		review.Rating = *req.Rating
	}
	if req.Title != nil {
		review.Title = *req.Title
	}
	if req.Comment != nil {
		review.Comment = *req.Comment
	}
	if req.Images != nil {
		review.Images = req.Images
	}

	if err := s.Repo.Update(review); err != nil {
		return nil, err
	}

	// Update destination rating
	go s.updateDestinationRating(review.DestinationID)

	destination, _ := s.getDestinationInfo(review.DestinationID)
	user, _ := s.getUserInfo(review.UserID)

	return s.toReviewResponse(review, destination, user), nil
}

// DeleteReview deletes a review
func (s *ReviewService) DeleteReview(reviewID uuid.UUID, userID uuid.UUID, isAdmin bool) error {
	review, err := s.Repo.FindByID(reviewID)
	if err != nil {
		return errors.New("review not found")
	}

	// Check permission
	if !isAdmin && review.UserID != userID {
		return errors.New("unauthorized to delete this review")
	}

	if err := s.Repo.Delete(reviewID); err != nil {
		return err
	}

	// Update destination rating
	go s.updateDestinationRating(review.DestinationID)

	return nil
}

// MarkHelpful marks a review as helpful
func (s *ReviewService) MarkHelpful(reviewID uuid.UUID) error {
	return s.Repo.UpdateHelpfulCount(reviewID)
}

// toReviewResponse converts model to response DTO
func (s *ReviewService) toReviewResponse(review *models.Review, destination map[string]interface{}, user map[string]interface{}) *dto.ReviewResponse {
	userName := "Anonymous"
	if name, ok := user["first_name"].(string); ok {
		if lastName, ok := user["last_name"].(string); ok {
			userName = fmt.Sprintf("%s %s", name, lastName)
		}
	}

	destName := ""
	if name, ok := destination["name"].(string); ok {
		destName = name
	}

	var bookingIDPtr *string
	if review.BookingID != nil {
		bid := review.BookingID.String()
		bookingIDPtr = &bid
	}

	return &dto.ReviewResponse{
		ID:              review.ID.String(),
		UserID:          review.UserID.String(),
		UserName:        userName,
		DestinationID:   review.DestinationID.String(),
		DestinationName: destName,
		BookingID:       bookingIDPtr,
		Rating:          review.Rating,
		Title:           review.Title,
		Comment:         review.Comment,
		Images:          review.Images,
		IsVerified:      review.IsVerified,
		IsApproved:      review.IsApproved,
		HelpfulCount:    review.HelpfulCount,
		CreatedAt:       review.CreatedAt,
		UpdatedAt:       review.UpdatedAt,
	}
}
