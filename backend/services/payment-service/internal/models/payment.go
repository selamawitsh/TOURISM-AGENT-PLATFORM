package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PaymentStatus represents the status of a payment
type PaymentStatus string

const (
	StatusPending   PaymentStatus = "pending"
	StatusSuccess   PaymentStatus = "success"
	StatusFailed    PaymentStatus = "failed"
	StatusRefunded  PaymentStatus = "refunded"
)

// PaymentMethod represents the payment method
type PaymentMethod string

const (
	MethodChapa    PaymentMethod = "chapa"
	MethodTelebirr PaymentMethod = "telebirr"
)

// Payment represents a payment transaction
type Payment struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	BookingID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"booking_id"`
	
	// Payment details
	TransactionRef string         `gorm:"size:100;uniqueIndex;not null" json:"transaction_ref"`
	Amount         float64        `gorm:"not null" json:"amount"`
	Currency       string         `gorm:"size:3;default:'ETB'" json:"currency"`
	Status         PaymentStatus  `gorm:"size:20;default:'pending'" json:"status"`
	PaymentMethod  PaymentMethod  `gorm:"size:20;default:'chapa'" json:"payment_method"`
	
	// Chapa specific
	ChapaTxRef     string         `gorm:"size:100;index" json:"chapa_tx_ref,omitempty"`
	PaymentURL     string         `gorm:"size:500" json:"payment_url,omitempty"`
	
	// Timestamps
	PaidAt         *time.Time     `json:"paid_at,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name
func (Payment) TableName() string {
	return "payments"
}

// BeforeCreate hook for UUID generation
func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}