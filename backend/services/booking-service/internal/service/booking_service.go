package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"booking-service/internal/config"
	"booking-service/internal/dto"
	"booking-service/internal/models"
	"booking-service/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookingService struct {
	Repo       *repository.BookingRepository
	Cfg        *config.Config
	HTTPClient *http.Client
}

func NewBookingService(repo *repository.BookingRepository, cfg *config.Config) *BookingService {
	return &BookingService{
		Repo:       repo,
		Cfg:        cfg,
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// getUserInfo fetches user details from User Service using the provided token
func (s *BookingService) getUserInfo(userID uuid.UUID, token string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/users/%s", s.Cfg.UserServiceURL, userID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	// Pass the user's token to authenticate with User Service
	req.Header.Set("Authorization", "Bearer "+token)
	
	resp, err := s.HTTPClient.Do(req)
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
func (s *BookingService) getDestinationInfo(destinationID uuid.UUID) (map[string]interface{}, error) {
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

// CreateBooking creates a new booking
func (s *BookingService) CreateBooking(userID uuid.UUID, req dto.CreateBookingRequest, token string) (*dto.BookingResponse, error) {
	// Parse destination ID
	destID, err := uuid.Parse(req.DestinationID)
	if err != nil {
		return nil, errors.New("invalid destination ID")
	}
	
	// Get destination info to validate and get price
	destination, err := s.getDestinationInfo(destID)
	if err != nil {
		return nil, errors.New("destination not found")
	}
	
	// Get user info using the token
	user, err := s.getUserInfo(userID, token)
	if err != nil {
		// If user info fetch fails, use placeholder data (booking still works)
		user = map[string]interface{}{
			"first_name": "Guest",
			"last_name":  "User",
			"email":      "",
			"phone":      nil,
		}
	}
	
	// Extract price from destination
	pricePerPerson, ok := destination["price_per_person"].(float64)
	if !ok {
		return nil, errors.New("invalid destination price")
	}
	
	// Calculate total price
	totalPrice := pricePerPerson * float64(req.NumberOfGuests)
	
	// Extract user details
	userName := fmt.Sprintf("%v %v", user["first_name"], user["last_name"])
	userEmail := fmt.Sprintf("%v", user["email"])
	userPhone := ""
	if phone, ok := user["phone"]; ok && phone != nil {
		userPhone = fmt.Sprintf("%v", phone)
	}
	
	// Override with provided contact phone if given
	if req.ContactPhone != "" {
		userPhone = req.ContactPhone
	}
	
	// Create booking
	booking := &models.Booking{
		UserID:          userID,
		DestinationID:   destID,
		BookingDate:     time.Now(),
		TravelDate:      req.TravelDate,
		NumberOfGuests:  req.NumberOfGuests,
		UnitPrice:       pricePerPerson,
		TotalPrice:      totalPrice,
		Currency:        "USD",
		Status:          models.StatusPending,
		ContactName:     userName,
		ContactEmail:    userEmail,
		ContactPhone:    userPhone,
		SpecialRequests: req.SpecialRequests,
	}
	
	if err := s.Repo.Create(booking); err != nil {
		return nil, err
	}
	
	return s.toBookingResponse(booking, destination), nil
}

// GetUserBookings returns all bookings for a user
func (s *BookingService) GetUserBookings(userID uuid.UUID, page, pageSize int) ([]dto.BookingListResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	
	offset := (page - 1) * pageSize
	bookings, total, err := s.Repo.FindByUserID(userID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	
	responses := make([]dto.BookingListResponse, len(bookings))
	for i, booking := range bookings {
		// Fetch destination info for each booking
		destination, err := s.getDestinationInfo(booking.DestinationID)
		destName := ""
		destCity := ""
		destCountry := ""
		if err == nil {
			if name, ok := destination["name"].(string); ok {
				destName = name
			}
			if city, ok := destination["city"].(string); ok {
				destCity = city
			}
			if country, ok := destination["country"].(string); ok {
				destCountry = country
			}
		}
		
		responses[i] = dto.BookingListResponse{
			ID:                 booking.ID.String(),
			DestinationName:    destName,
			DestinationCity:    destCity,
			DestinationCountry: destCountry,
			TravelDate:         booking.TravelDate,
			NumberOfGuests:     booking.NumberOfGuests,
			TotalPrice:         booking.TotalPrice,
			Status:             string(booking.Status),
			BookingDate:        booking.CreatedAt,
		}
	}
	
	return responses, total, nil
}

// GetBookingByID returns a specific booking
func (s *BookingService) GetBookingByID(bookingID uuid.UUID, userID uuid.UUID, isAdmin bool) (*dto.BookingResponse, error) {
	booking, err := s.Repo.FindByID(bookingID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("booking not found")
		}
		return nil, err
	}
	
	// Check permission: user can only see their own bookings unless admin
	if !isAdmin && booking.UserID != userID {
		return nil, errors.New("unauthorized to view this booking")
	}
	
	// Get destination info
	destination, err := s.getDestinationInfo(booking.DestinationID)
	if err != nil {
		return nil, err
	}
	
	return s.toBookingResponse(booking, destination), nil
}

// CancelBooking cancels a booking
func (s *BookingService) CancelBooking(bookingID uuid.UUID, userID uuid.UUID, isAdmin bool) (*dto.CancelBookingResponse, error) {
	booking, err := s.Repo.FindByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}
	
	// Check permission
	if !isAdmin && booking.UserID != userID {
		return nil, errors.New("unauthorized to cancel this booking")
	}
	
	// Check if booking can be cancelled (only pending or confirmed)
	if booking.Status == models.StatusCancelled {
		return nil, errors.New("booking already cancelled")
	}
	if booking.Status == models.StatusCompleted {
		return nil, errors.New("cannot cancel completed booking")
	}
	
	// Check if travel date is in the past
	if booking.TravelDate.Before(time.Now()) {
		return nil, errors.New("cannot cancel past bookings")
	}
	
	if err := s.Repo.UpdateStatus(bookingID, models.StatusCancelled); err != nil {
		return nil, err
	}
	
	return &dto.CancelBookingResponse{
		ID:      bookingID.String(),
		Status:  string(models.StatusCancelled),
		Message: "Booking cancelled successfully",
	}, nil
}

// GetAllBookings returns all bookings (admin only)
func (s *BookingService) GetAllBookings(page, pageSize int) ([]dto.BookingListResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	
	offset := (page - 1) * pageSize
	bookings, total, err := s.Repo.FindAll(pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	
	responses := make([]dto.BookingListResponse, len(bookings))
	for i, booking := range bookings {
		destination, err := s.getDestinationInfo(booking.DestinationID)
		destName := ""
		destCity := ""
		destCountry := ""
		if err == nil {
			if name, ok := destination["name"].(string); ok {
				destName = name
			}
			if city, ok := destination["city"].(string); ok {
				destCity = city
			}
			if country, ok := destination["country"].(string); ok {
				destCountry = country
			}
		}
		
		responses[i] = dto.BookingListResponse{
			ID:                 booking.ID.String(),
			DestinationName:    destName,
			DestinationCity:    destCity,
			DestinationCountry: destCountry,
			TravelDate:         booking.TravelDate,
			NumberOfGuests:     booking.NumberOfGuests,
			TotalPrice:         booking.TotalPrice,
			Status:             string(booking.Status),
			BookingDate:        booking.CreatedAt,
		}
	}
	
	return responses, total, nil
}

// toBookingResponse converts booking model to response DTO
func (s *BookingService) toBookingResponse(booking *models.Booking, destination map[string]interface{}) *dto.BookingResponse {
	destName := ""
	destCity := ""
	destCountry := ""
	destImage := ""
	
	if name, ok := destination["name"].(string); ok {
		destName = name
	}
	if city, ok := destination["city"].(string); ok {
		destCity = city
	}
	if country, ok := destination["country"].(string); ok {
		destCountry = country
	}
	if image, ok := destination["main_image"].(string); ok {
		destImage = image
	}
	
	return &dto.BookingResponse{
		ID:                 booking.ID.String(),
		UserID:             booking.UserID.String(),
		DestinationID:      booking.DestinationID.String(),
		DestinationName:    destName,
		DestinationCity:    destCity,
		DestinationCountry: destCountry,
		DestinationImage:   destImage,
		BookingDate:        booking.BookingDate,
		TravelDate:         booking.TravelDate,
		NumberOfGuests:     booking.NumberOfGuests,
		UnitPrice:          booking.UnitPrice,
		TotalPrice:         booking.TotalPrice,
		Currency:           booking.Currency,
		Status:             string(booking.Status),
		ContactName:        booking.ContactName,
		ContactEmail:       booking.ContactEmail,
		ContactPhone:       booking.ContactPhone,
		SpecialRequests:    booking.SpecialRequests,
		CreatedAt:          booking.CreatedAt,
		UpdatedAt:          booking.UpdatedAt,
	}
}

// GetBookingByIDPublic returns booking details for payment service
func (s *BookingService) GetBookingByIDPublic(bookingID uuid.UUID) (*dto.BookingResponse, error) {
    booking, err := s.Repo.FindByID(bookingID)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("booking not found")
        }
        return nil, err
    }
    
    // Get destination info
    destination, err := s.getDestinationInfo(booking.DestinationID)
    if err != nil {
        return nil, err
    }
    
    return s.toBookingResponse(booking, destination), nil
}