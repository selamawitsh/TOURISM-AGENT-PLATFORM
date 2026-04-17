package dto

import (
	"time"
)

// InitializePaymentRequest - What client sends to start payment
type InitializePaymentRequest struct {
	BookingID string `json:"booking_id" binding:"required"`
}

// PaymentResponse - What client receives after initialization
type PaymentResponse struct {
	ID             string    `json:"id"`
	TransactionRef string    `json:"transaction_ref"`
	Amount         float64   `json:"amount"`
	Currency       string    `json:"currency"`
	Status         string    `json:"status"`
	PaymentURL     string    `json:"payment_url,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

// PaymentStatusResponse - Status check response
type PaymentStatusResponse struct {
	ID             string     `json:"id"`
	TransactionRef string     `json:"transaction_ref"`
	BookingID      string     `json:"booking_id"`
	Amount         float64    `json:"amount"`
	Status         string     `json:"status"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
}

// ChapaWebhookPayload - Chapa webhook request body
type ChapaWebhookPayload struct {
	TransactionRef string `json:"transaction_ref"`
	Status         string `json:"status"`
	TxRef          string `json:"tx_ref"`
}

// PaymentConfirmationResponse - After successful payment
type PaymentConfirmationResponse struct {
	PaymentID      string    `json:"payment_id"`
	BookingID      string    `json:"booking_id"`
	Status         string    `json:"status"`
	Amount         float64   `json:"amount"`
	PaidAt         time.Time `json:"paid_at"`
	Message        string    `json:"message"`
}