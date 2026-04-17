package service

import (
	"time"

	"analytics-service/internal/config"
	"analytics-service/internal/dto"
	"analytics-service/internal/repository"
)

type AnalyticsService struct {
	Repo *repository.AnalyticsRepository
	Cfg  *config.Config
}

func NewAnalyticsService(repo *repository.AnalyticsRepository, cfg *config.Config) *AnalyticsService {
	return &AnalyticsService{
		Repo: repo,
		Cfg:  cfg,
	}
}

// GetBookingAnalytics returns booking statistics over time
func (s *AnalyticsService) GetBookingAnalytics(period string) (*dto.BookingAnalyticsResponse, error) {
	now := time.Now()
	var startDate time.Time
	var groupBy string
	
	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
		groupBy = "day"
	case "month":
		startDate = now.AddDate(0, -1, 0)
		groupBy = "day"
	case "year":
		startDate = now.AddDate(-1, 0, 0)
		groupBy = "month"
	default:
		startDate = now.AddDate(0, 0, -30)
		groupBy = "day"
	}
	
	bookings, err := s.Repo.GetBookingsByDateRange(startDate, now, groupBy)
	if err != nil {
		return nil, err
	}
	
	// Get counts by status
	var totalConfirmed, totalCancelled, totalCompleted int64
	s.Repo.DB.Raw("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'").Scan(&totalConfirmed)
	s.Repo.DB.Raw("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'").Scan(&totalCancelled)
	s.Repo.DB.Raw("SELECT COUNT(*) FROM bookings WHERE status = 'completed'").Scan(&totalCompleted)
	
	var totalBookings int64
	s.Repo.DB.Raw("SELECT COUNT(*) FROM bookings").Scan(&totalBookings)
	
	points := make([]dto.BookingPoint, len(bookings))
	for i, b := range bookings {
		points[i] = dto.BookingPoint{
			Date:    b.Date,
			Count:   b.Count,
			Revenue: b.Revenue,
		}
	}
	
	return &dto.BookingAnalyticsResponse{
		Period:            period,
		TotalBookings:     totalBookings,
		ConfirmedBookings: totalConfirmed,
		CancelledBookings: totalCancelled,
		CompletedBookings: totalCompleted,
		Data:              points,
	}, nil
}

// GetRevenueAnalytics returns revenue reports
func (s *AnalyticsService) GetRevenueAnalytics(period string) (*dto.RevenueAnalyticsResponse, error) {
	now := time.Now()
	var startDate time.Time
	
	switch period {
	case "month":
		startDate = now.AddDate(0, -1, 0)
	case "year":
		startDate = now.AddDate(-1, 0, 0)
	default:
		startDate = now.AddDate(0, 0, -30)
	}
	
	revenue, err := s.Repo.GetTotalRevenue(startDate, now)
	if err != nil {
		return nil, err
	}
	
	bookings, err := s.Repo.GetBookingsByDateRange(startDate, now, "day")
	if err != nil {
		return nil, err
	}
	
	var totalBookings int64
	for _, b := range bookings {
		totalBookings += b.Count
	}
	
	averageOrder := float64(0)
	if totalBookings > 0 {
		averageOrder = revenue / float64(totalBookings)
	}
	
	points := make([]dto.RevenuePoint, len(bookings))
	for i, b := range bookings {
		points[i] = dto.RevenuePoint{
			Date:    b.Date,
			Revenue: b.Revenue,
			Count:   b.Count,
		}
	}
	
	return &dto.RevenueAnalyticsResponse{
		Period:       period,
		TotalRevenue: revenue,
		AverageOrder: averageOrder,
		Data:         points,
	}, nil
}

// GetPopularDestinations returns most booked destinations
func (s *AnalyticsService) GetPopularDestinations(limit int) (*dto.PopularDestinationResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	
	destinations, err := s.Repo.GetPopularDestinations(limit)
	if err != nil {
		return nil, err
	}
	
	stats := make([]dto.DestinationStat, len(destinations))
	for i, d := range destinations {
		stats[i] = dto.DestinationStat{
			ID:           d.DestinationID,
			Name:         d.DestinationName,
			City:         d.City,
			Country:      d.Country,
			BookingCount: d.BookingCount,
			TotalRevenue: d.TotalRevenue,
		}
	}
	
	return &dto.PopularDestinationResponse{
		Destinations: stats,
	}, nil
}

// GetUserGrowth returns user registration analytics
func (s *AnalyticsService) GetUserGrowth(period string) (*dto.UserGrowthResponse, error) {
	now := time.Now()
	var startDate time.Time
	var groupBy string
	
	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
		groupBy = "day"
	case "month":
		startDate = now.AddDate(0, -1, 0)
		groupBy = "day"
	case "year":
		startDate = now.AddDate(-1, 0, 0)
		groupBy = "month"
	default:
		startDate = now.AddDate(0, 0, -30)
		groupBy = "day"
	}
	
	growth, err := s.Repo.GetUserGrowth(startDate, now, groupBy)
	if err != nil {
		return nil, err
	}
	
	var totalUsers int64
	s.Repo.DB.Raw("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	
	var newUsers int64
	for _, g := range growth {
		newUsers += g.NewUsers
	}
	
	points := make([]dto.UserPoint, len(growth))
	for i, g := range growth {
		points[i] = dto.UserPoint{
			Date:       g.Date,
			NewUsers:   g.NewUsers,
			TotalUsers: g.TotalUsers,
		}
	}
	
	return &dto.UserGrowthResponse{
		Period:     period,
		TotalUsers: totalUsers,
		NewUsers:   newUsers,
		Data:       points,
	}, nil
}

// GetReviewAnalytics returns review statistics
func (s *AnalyticsService) GetReviewAnalytics() (*dto.ReviewAnalyticsResponse, error) {
	stats, err := s.Repo.GetReviewAnalytics()
	if err != nil {
		return nil, err
	}
	
	byCategory, err := s.Repo.GetReviewsByCategory()
	if err != nil {
		return nil, err
	}
	
	categoryRatings := make([]dto.CategoryRating, len(byCategory))
	for i, c := range byCategory {
		categoryRatings[i] = dto.CategoryRating{
			CategoryID:    c.CategoryID,
			CategoryName:  c.CategoryName,
			TotalReviews:  c.TotalReviews,
			AverageRating: c.AverageRating,
		}
	}
	
	return &dto.ReviewAnalyticsResponse{
		TotalReviews:       stats.TotalReviews,
		AverageRating:      stats.AverageRating,
		RatingDistribution: stats.RatingDistribution,
		ByCategory:         categoryRatings,
	}, nil
}

// GetDashboardSummary returns all key metrics for the dashboard
func (s *AnalyticsService) GetDashboardSummary() (*dto.DashboardSummaryResponse, error) {
	totalBookings, _ := s.Repo.GetTotalBookingsCount()
	totalRevenue, _ := s.Repo.GetTotalRevenue(time.Now().AddDate(-1, 0, 0), time.Now())
	totalUsers, _ := s.Repo.GetTotalUsersCount()
	totalDestinations, _ := s.Repo.GetTotalDestinationsCount()
	pendingPayments, _ := s.Repo.GetPendingPaymentsCount()
	
	reviewStats, _ := s.Repo.GetReviewAnalytics()
	
	popular, _ := s.Repo.GetPopularDestinations(5)
	popularDestinations := make([]dto.DestinationStat, len(popular))
	for i, p := range popular {
		popularDestinations[i] = dto.DestinationStat{
			ID:           p.DestinationID,
			Name:         p.DestinationName,
			City:         p.City,
			Country:      p.Country,
			BookingCount: p.BookingCount,
			TotalRevenue: p.TotalRevenue,
		}
	}
	
	recentBookings, _ := s.Repo.GetBookingsByDateRange(time.Now().AddDate(0, 0, -7), time.Now(), "day")
	recentPoints := make([]dto.BookingPoint, len(recentBookings))
	for i, b := range recentBookings {
		recentPoints[i] = dto.BookingPoint{
			Date:   b.Date,
			Count:  b.Count,
			Revenue: b.Revenue,
		}
	}
	
	return &dto.DashboardSummaryResponse{
		TotalBookings:      totalBookings,
		TotalRevenue:       totalRevenue,
		TotalUsers:         totalUsers,
		TotalDestinations:  totalDestinations,
		AverageRating:      reviewStats.AverageRating,
		PendingPayments:    pendingPayments,
		RecentBookings:     recentPoints,
		PopularDestinations: popularDestinations,
	}, nil
}