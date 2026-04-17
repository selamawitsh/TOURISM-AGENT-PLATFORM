package dto

// import "time"

// BookingAnalyticsResponse - Bookings over time
type BookingAnalyticsResponse struct {
	Period       string    `json:"period"`
	TotalBookings int64     `json:"total_bookings"`
	ConfirmedBookings int64 `json:"confirmed_bookings"`
	CancelledBookings int64 `json:"cancelled_bookings"`
	CompletedBookings int64 `json:"completed_bookings"`
	Data         []BookingPoint `json:"data"`
}

type BookingPoint struct {
	Date   string `json:"date"`
	Count  int64  `json:"count"`
	Revenue float64 `json:"revenue"`
}

// RevenueAnalyticsResponse - Revenue reports
type RevenueAnalyticsResponse struct {
	Period       string         `json:"period"`
	TotalRevenue float64        `json:"total_revenue"`
	AverageOrder float64        `json:"average_order"`
	Data         []RevenuePoint `json:"data"`
}

type RevenuePoint struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
	Count   int64   `json:"count"`
}

// PopularDestinationResponse - Most booked destinations
type PopularDestinationResponse struct {
	Destinations []DestinationStat `json:"destinations"`
}

type DestinationStat struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	City          string  `json:"city"`
	Country       string  `json:"country"`
	BookingCount  int64   `json:"booking_count"`
	TotalRevenue  float64 `json:"total_revenue"`
	AverageRating float64 `json:"average_rating"`
}

// UserGrowthResponse - New user registrations
type UserGrowthResponse struct {
	Period      string      `json:"period"`
	TotalUsers  int64       `json:"total_users"`
	NewUsers    int64       `json:"new_users"`
	Data        []UserPoint `json:"data"`
}

type UserPoint struct {
	Date      string `json:"date"`
	NewUsers  int64  `json:"new_users"`
	TotalUsers int64 `json:"total_users"`
}

// ReviewAnalyticsResponse - Review analytics
type ReviewAnalyticsResponse struct {
	TotalReviews   int64              `json:"total_reviews"`
	AverageRating  float64            `json:"average_rating"`
	RatingDistribution map[int]int64  `json:"rating_distribution"`
	ByCategory     []CategoryRating   `json:"by_category"`
}

type CategoryRating struct {
	CategoryID     string  `json:"category_id"`
	CategoryName   string  `json:"category_name"`
	TotalReviews   int64   `json:"total_reviews"`
	AverageRating  float64 `json:"average_rating"`
}

// DashboardSummaryResponse - Complete dashboard data
type DashboardSummaryResponse struct {
	TotalBookings      int64   `json:"total_bookings"`
	TotalRevenue       float64 `json:"total_revenue"`
	TotalUsers         int64   `json:"total_users"`
	TotalDestinations  int64   `json:"total_destinations"`
	AverageRating      float64 `json:"average_rating"`
	PendingPayments    int64   `json:"pending_payments"`
	RecentBookings     []BookingPoint `json:"recent_bookings"`
	PopularDestinations []DestinationStat `json:"popular_destinations"`
}