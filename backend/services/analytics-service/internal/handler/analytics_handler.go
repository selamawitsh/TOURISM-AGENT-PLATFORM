package handler

import (
	"net/http"
	"strconv"

	"analytics-service/internal/service"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	AnalyticsService *service.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{AnalyticsService: analyticsService}
}

// GetBookingAnalytics returns booking statistics
// GET /api/v1/admin/analytics/bookings?period=month
func (h *AnalyticsHandler) GetBookingAnalytics(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	
	analytics, err := h.AnalyticsService.GetBookingAnalytics(period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, analytics)
}

// GetRevenueAnalytics returns revenue reports
// GET /api/v1/admin/analytics/revenue?period=month
func (h *AnalyticsHandler) GetRevenueAnalytics(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	
	analytics, err := h.AnalyticsService.GetRevenueAnalytics(period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, analytics)
}

// GetPopularDestinations returns most booked destinations
// GET /api/v1/admin/analytics/popular-destinations?limit=10
func (h *AnalyticsHandler) GetPopularDestinations(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	destinations, err := h.AnalyticsService.GetPopularDestinations(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, destinations)
}

// GetUserGrowth returns user registration analytics
// GET /api/v1/admin/analytics/user-growth?period=month
func (h *AnalyticsHandler) GetUserGrowth(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	
	growth, err := h.AnalyticsService.GetUserGrowth(period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, growth)
}

// GetReviewAnalytics returns review statistics
// GET /api/v1/admin/analytics/reviews
func (h *AnalyticsHandler) GetReviewAnalytics(c *gin.Context) {
	analytics, err := h.AnalyticsService.GetReviewAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, analytics)
}

// GetDashboardSummary returns all key metrics
// GET /api/v1/admin/analytics/dashboard
func (h *AnalyticsHandler) GetDashboardSummary(c *gin.Context) {
	summary, err := h.AnalyticsService.GetDashboardSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, summary)
}