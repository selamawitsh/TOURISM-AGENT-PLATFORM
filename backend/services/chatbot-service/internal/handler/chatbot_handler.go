package handler

import (
	"net/http"

	"chatbot-service/internal/service"

	"github.com/gin-gonic/gin"
)

type ChatbotHandler struct {
	chatbotService *service.ChatbotService
}

func NewChatbotHandler(chatbotService *service.ChatbotService) *ChatbotHandler {
	return &ChatbotHandler{chatbotService: chatbotService}
}

// Chat handles chat messages
// POST /api/v1/chat
func (h *ChatbotHandler) Chat(c *gin.Context) {
	var req service.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message is required"})
		return
	}

	resp, err := h.chatbotService.SendMessage(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Recommend destinations based on preferences
// POST /api/v1/chat/recommend
func (h *ChatbotHandler) Recommend(c *gin.Context) {
	var req struct {
		Preferences string `json:"preferences" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.chatbotService.GetTravelRecommendation(c.Request.Context(), req.Preferences)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"recommendations": response})
}