package routes

import (
	"favorites-service/internal/config"
	"favorites-service/internal/handler"
	"favorites-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, favoriteHandler *handler.FavoriteHandler, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "favorites-service",
			"message": "Favorites service is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware(cfg))
	{
		favorites := v1.Group("/favorites")
		{
			favorites.POST("", favoriteHandler.AddFavorite)
			favorites.GET("", favoriteHandler.GetFavorites)
			favorites.GET("/check/:destination_id", favoriteHandler.CheckFavorite)
			favorites.DELETE("/:destination_id", favoriteHandler.RemoveFavorite)
		}
	}
}