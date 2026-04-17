package handler

import (
	"net/http"

	"payment-service/internal/dto"
	"payment-service/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PaymentHandler struct {
	PaymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{PaymentService: paymentService}
}

// InitializePayment handles payment initialization
// POST /api/v1/payments/initialize
func (h *PaymentHandler) InitializePayment(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}
	
	// Get token from header to pass to other services
	authHeader := c.GetHeader("Authorization")
	
	var req dto.InitializePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	payment, err := h.PaymentService.InitializePayment(userID, authHeader, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, payment)
}

// VerifyPayment verifies payment status
// GET /api/v1/payments/verify/:transaction_ref
func (h *PaymentHandler) VerifyPayment(c *gin.Context) {
	transactionRef := c.Param("transaction_ref")
	
	payment, err := h.PaymentService.VerifyPayment(transactionRef)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, payment)
}

// GetPaymentStatus returns payment status
// GET /api/v1/payments/status/:transaction_ref
func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}
	
	userRole, _ := c.Get("user_role")
	isAdmin := userRole == "admin"
	
	transactionRef := c.Param("transaction_ref")
	
	payment, err := h.PaymentService.GetPaymentStatus(transactionRef, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, payment)
}

// Webhook handles Chapa webhook callbacks
// POST /api/v1/payments/webhook
func (h *PaymentHandler) Webhook(c *gin.Context) {
	var payload dto.ChapaWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.PaymentService.HandleWebhook(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}