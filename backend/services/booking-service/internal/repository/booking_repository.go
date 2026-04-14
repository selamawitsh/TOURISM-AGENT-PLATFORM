package repository

import (
	"booking-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookingRepository struct {
	DB *gorm.DB
}

func NewBookingRepository(db *gorm.DB) *BookingRepository {
	return &BookingRepository{DB: db}
}

// Create creates a new booking
func (r *BookingRepository) Create(booking *models.Booking) error {
	return r.DB.Create(booking).Error
}

// FindByID finds a booking by ID
func (r *BookingRepository) FindByID(id uuid.UUID) (*models.Booking, error) {
	var booking models.Booking
	err := r.DB.First(&booking, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

// FindByUserID finds all bookings for a user
func (r *BookingRepository) FindByUserID(userID uuid.UUID, limit, offset int) ([]models.Booking, int64, error) {
	var bookings []models.Booking
	var total int64

	query := r.DB.Model(&models.Booking{}).Where("user_id = ?", userID)
	query.Count(&total)
	
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&bookings).Error
	return bookings, total, err
}

// FindAll finds all bookings (admin only)
func (r *BookingRepository) FindAll(limit, offset int) ([]models.Booking, int64, error) {
	var bookings []models.Booking
	var total int64

	r.DB.Model(&models.Booking{}).Count(&total)
	err := r.DB.Order("created_at DESC").Limit(limit).Offset(offset).Find(&bookings).Error
	return bookings, total, err
}

// Update updates a booking
func (r *BookingRepository) Update(booking *models.Booking) error {
	return r.DB.Save(booking).Error
}

// UpdateStatus updates booking status
func (r *BookingRepository) UpdateStatus(id uuid.UUID, status models.BookingStatus) error {
	return r.DB.Model(&models.Booking{}).Where("id = ?", id).Update("status", status).Error
}

// FindUpcomingBookings finds bookings with travel date in the future
func (r *BookingRepository) FindUpcomingBookings(userID uuid.UUID) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.DB.Where("user_id = ? AND travel_date > NOW() AND status != ?", userID, models.StatusCancelled).
		Order("travel_date ASC").Find(&bookings).Error
	return bookings, err
}