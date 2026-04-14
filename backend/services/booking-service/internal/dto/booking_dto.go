package dto

import (
	"time"
)

// CreateBookingRequest - What client sends to create a booking
type CreateBookingRequest struct {
	DestinationID   string    `json:"destination_id" binding:"required"`
	TravelDate      time.Time `json:"travel_date" binding:"required"`
	NumberOfGuests  int       `json:"number_of_guests" binding:"required,min=1"`
	SpecialRequests string    `json:"special_requests,omitempty"`
	ContactPhone    string    `json:"contact_phone,omitempty"`
}

// UpdateBookingRequest - What client sends to update a booking
type UpdateBookingRequest struct {
	TravelDate      *time.Time `json:"travel_date,omitempty"`
	NumberOfGuests  *int      `json:"number_of_guests,omitempty"`
	SpecialRequests *string   `json:"special_requests,omitempty"`
	ContactPhone    *string   `json:"contact_phone,omitempty"`
}

// BookingResponse - What client receives
type BookingResponse struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	DestinationID   string    `json:"destination_id"`
	DestinationName string    `json:"destination_name"`
	DestinationCity string    `json:"destination_city"`
	DestinationCountry string `json:"destination_country"`
	DestinationImage string   `json:"destination_image"`
	BookingDate     time.Time `json:"booking_date"`
	TravelDate      time.Time `json:"travel_date"`
	NumberOfGuests  int       `json:"number_of_guests"`
	UnitPrice       float64   `json:"unit_price"`
	TotalPrice      float64   `json:"total_price"`
	Currency        string    `json:"currency"`
	Status          string    `json:"status"`
	ContactName     string    `json:"contact_name"`
	ContactEmail    string    `json:"contact_email"`
	ContactPhone    string    `json:"contact_phone"`
	SpecialRequests string    `json:"special_requests,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// BookingListResponse - For listing bookings
type BookingListResponse struct {
	ID              string    `json:"id"`
	DestinationName string    `json:"destination_name"`
	DestinationCity string    `json:"destination_city"`
	DestinationCountry string `json:"destination_country"`
	TravelDate      time.Time `json:"travel_date"`
	NumberOfGuests  int       `json:"number_of_guests"`
	TotalPrice      float64   `json:"total_price"`
	Status          string    `json:"status"`
	BookingDate     time.Time `json:"booking_date"`
}

// CancelBookingResponse - Response after cancellation
type CancelBookingResponse struct {
	ID      string `json:"id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}