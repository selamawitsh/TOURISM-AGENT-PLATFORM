package handler

import (
	"log"
	"net/http"
	"strconv"

	"destination-service/internal/dto"
	"destination-service/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DestinationHandler struct {
	DestinationService *service.DestinationService
}

func NewDestinationHandler(destinationService *service.DestinationService) *DestinationHandler {
	return &DestinationHandler{DestinationService: destinationService}
}

// Public endpoints (no auth required)
func (h *DestinationHandler) ListDestinations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	destinations, total, err := h.DestinationService.ListDestinations(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        destinations,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
		"total_pages": (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func (h *DestinationHandler) GetDestinationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid destination ID"})
		return
	}

	destination, err := h.DestinationService.GetDestinationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, destination)
}

func (h *DestinationHandler) GetDestinationBySlug(c *gin.Context) {
	slug := c.Param("slug")
	destination, err := h.DestinationService.GetDestinationBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, destination)
}

func (h *DestinationHandler) GetFeaturedDestinations(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "6"))
	destinations, err := h.DestinationService.GetFeaturedDestinations(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, destinations)
}

func (h *DestinationHandler) GetAllCategories(c *gin.Context) {
	categories, err := h.DestinationService.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// Admin endpoints (require authentication + admin role)
func (h *DestinationHandler) CreateDestination(c *gin.Context) {
	log.Println("🔥 CreateDestination handler called!")

	// Check if user is admin (this should be done by middleware, but double-check)
	userRole, exists := c.Get("user_role")
	if !exists {
		log.Println("❌ No user_role found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized - no role found"})
		return
	}

	log.Printf("✅ User role: %v", userRole)

	if userRole != "admin" {
		log.Printf("❌ User role %v is not admin", userRole)
		c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
		return
	}

	var req dto.CreateDestinationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✅ Creating destination: %s", req.Name)

	destination, err := h.DestinationService.CreateDestination(req)
	if err != nil {
		log.Printf("❌ Service error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✅ Destination created successfully with ID: %v", destination.ID)
	c.JSON(http.StatusCreated, destination)
}

func (h *DestinationHandler) UpdateDestination(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid destination ID"})
		return
	}

	var req dto.UpdateDestinationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	destination, err := h.DestinationService.UpdateDestination(id, req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, destination)
}

func (h *DestinationHandler) DeleteDestination(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid destination ID"})
		return
	}

	if err := h.DestinationService.DeleteDestination(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "destination deleted successfully"})
}

func (h *DestinationHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category, err := h.DestinationService.CreateCategory(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}