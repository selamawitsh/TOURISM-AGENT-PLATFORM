package repository

import (
	"payment-service/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	DB *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{DB: db}
}

// Create creates a new payment
func (r *PaymentRepository) Create(payment *models.Payment) error {
	return r.DB.Create(payment).Error
}

// FindByID finds a payment by ID
func (r *PaymentRepository) FindByID(id uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	err := r.DB.First(&payment, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// FindByTransactionRef finds a payment by transaction reference
func (r *PaymentRepository) FindByTransactionRef(txRef string) (*models.Payment, error) {
	var payment models.Payment
	err := r.DB.Where("transaction_ref = ?", txRef).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// FindByBookingID finds a payment by booking ID
func (r *PaymentRepository) FindByBookingID(bookingID uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	err := r.DB.Where("booking_id = ?", bookingID).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// Update updates a payment
func (r *PaymentRepository) Update(payment *models.Payment) error {
	return r.DB.Save(payment).Error
}

// UpdateStatus updates payment status
func (r *PaymentRepository) UpdateStatus(id uuid.UUID, status models.PaymentStatus, paidAt *time.Time) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if paidAt != nil {
		updates["paid_at"] = paidAt
	}
	return r.DB.Model(&models.Payment{}).Where("id = ?", id).Updates(updates).Error
}