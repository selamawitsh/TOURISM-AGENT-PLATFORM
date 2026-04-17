package repository

import (
	"time"

	"gorm.io/gorm"
)

type AnalyticsRepository struct {
	DB *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) *AnalyticsRepository {
	return &AnalyticsRepository{DB: db}
}

// GetBookingsByDateRange returns bookings grouped by date
func (r *AnalyticsRepository) GetBookingsByDateRange(startDate, endDate time.Time, groupBy string) ([]struct {
	Date    string
	Count   int64
	Revenue float64
}, error) {
	var results []struct {
		Date    string
		Count   int64
		Revenue float64
	}
	
	dateFormat := "YYYY-MM-DD"
	if groupBy == "month" {
		dateFormat = "YYYY-MM"
	} else if groupBy == "week" {
		dateFormat = "YYYY-WW"
	}
	
	query := `
		SELECT 
			TO_CHAR(created_at, $1) as date,
			COUNT(*) as count,
			COALESCE(SUM(total_price), 0) as revenue
		FROM bookings
		WHERE created_at BETWEEN $2 AND $3
		GROUP BY TO_CHAR(created_at, $1)
		ORDER BY date ASC
	`
	
	r.DB.Raw(query, dateFormat, startDate, endDate).Scan(&results)
	return results, nil
}

// GetTotalRevenue returns total revenue
func (r *AnalyticsRepository) GetTotalRevenue(startDate, endDate time.Time) (float64, error) {
	var revenue float64
	query := `
		SELECT COALESCE(SUM(total_price), 0)
		FROM bookings
		WHERE status = 'confirmed' AND created_at BETWEEN $1 AND $2
	`
	r.DB.Raw(query, startDate, endDate).Scan(&revenue)
	return revenue, nil
}

// GetPopularDestinations returns most booked destinations
func (r *AnalyticsRepository) GetPopularDestinations(limit int) ([]struct {
	DestinationID   string
	DestinationName string
	City            string
	Country         string
	BookingCount    int64
	TotalRevenue    float64
}, error) {
	var results []struct {
		DestinationID   string
		DestinationName string
		City            string
		Country         string
		BookingCount    int64
		TotalRevenue    float64
	}
	
	query := `
		SELECT 
			b.destination_id,
			d.name as destination_name,
			d.city,
			d.country,
			COUNT(*) as booking_count,
			COALESCE(SUM(b.total_price), 0) as total_revenue
		FROM bookings b
		JOIN destinations d ON b.destination_id = d.id
		WHERE b.status = 'confirmed'
		GROUP BY b.destination_id, d.name, d.city, d.country
		ORDER BY booking_count DESC
		LIMIT $1
	`
	
	r.DB.Raw(query, limit).Scan(&results)
	return results, nil
}

// GetUserGrowth returns new user registrations over time
func (r *AnalyticsRepository) GetUserGrowth(startDate, endDate time.Time, groupBy string) ([]struct {
	Date       string
	NewUsers   int64
	TotalUsers int64
}, error) {
	var results []struct {
		Date       string
		NewUsers   int64
		TotalUsers int64
	}
	
	dateFormat := "YYYY-MM-DD"
	if groupBy == "month" {
		dateFormat = "YYYY-MM"
	} else if groupBy == "week" {
		dateFormat = "YYYY-WW"
	}
	
	query := `
		SELECT 
			TO_CHAR(created_at, $1) as date,
			COUNT(*) as new_users
		FROM users
		WHERE created_at BETWEEN $2 AND $3
		GROUP BY TO_CHAR(created_at, $1)
		ORDER BY date ASC
	`
	
	r.DB.Raw(query, dateFormat, startDate, endDate).Scan(&results)
	return results, nil
}

// GetReviewAnalytics returns review statistics
func (r *AnalyticsRepository) GetReviewAnalytics() (struct {
	TotalReviews   int64
	AverageRating  float64
	RatingDistribution map[int]int64
}, error) {
	var result struct {
		TotalReviews   int64
		AverageRating  float64
		RatingDistribution map[int]int64
	}
	
	result.RatingDistribution = make(map[int]int64)
	
	var stats struct {
		TotalReviews  int64
		AverageRating float64
	}
	r.DB.Raw("SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating), 0) as average_rating FROM reviews WHERE is_approved = true").Scan(&stats)
	result.TotalReviews = stats.TotalReviews
	result.AverageRating = stats.AverageRating
	
	var ratings []struct {
		Rating int
		Count  int64
	}
	r.DB.Raw("SELECT rating, COUNT(*) as count FROM reviews WHERE is_approved = true GROUP BY rating ORDER BY rating").Scan(&ratings)
	
	for _, rating := range ratings {
		result.RatingDistribution[rating.Rating] = rating.Count
	}
	
	return result, nil
}

// GetReviewsByCategory returns review stats per category
func (r *AnalyticsRepository) GetReviewsByCategory() ([]struct {
	CategoryID    string
	CategoryName  string
	TotalReviews  int64
	AverageRating float64
}, error) {
	var results []struct {
		CategoryID    string
		CategoryName  string
		TotalReviews  int64
		AverageRating float64
	}
	
	query := `
		SELECT 
			c.id as category_id,
			c.name as category_name,
			COUNT(r.id) as total_reviews,
			COALESCE(AVG(r.rating), 0) as average_rating
		FROM categories c
		LEFT JOIN destinations d ON d.category_id = c.id
		LEFT JOIN reviews r ON r.destination_id = d.id AND r.is_approved = true
		GROUP BY c.id, c.name
		ORDER BY total_reviews DESC
	`
	
	r.DB.Raw(query).Scan(&results)
	return results, nil
}

// GetTotalBookingsCount returns total number of bookings
func (r *AnalyticsRepository) GetTotalBookingsCount() (int64, error) {
	var count int64
	r.DB.Table("bookings").Count(&count)
	return count, nil
}

// GetTotalUsersCount returns total number of users
func (r *AnalyticsRepository) GetTotalUsersCount() (int64, error) {
	var count int64
	r.DB.Table("users").Count(&count)
	return count, nil
}

// GetTotalDestinationsCount returns total number of destinations
func (r *AnalyticsRepository) GetTotalDestinationsCount() (int64, error) {
	var count int64
	r.DB.Table("destinations").Where("is_active = true").Count(&count)
	return count, nil
}

// GetPendingPaymentsCount returns count of pending payments
func (r *AnalyticsRepository) GetPendingPaymentsCount() (int64, error) {
	var count int64
	r.DB.Table("payments").Where("status = 'pending'").Count(&count)
	return count, nil
}