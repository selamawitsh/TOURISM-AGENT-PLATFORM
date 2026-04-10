package database

import (
	"log"

	"user-service/internal/config"
	"user-service/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ConnectDB creates a connection to PostgreSQL
func ConnectDB(cfg *config.Config) *gorm.DB {
	// Open connection to database using the URL from config
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		// If connection fails, stop the program (can't work without database)
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connected successfully")

	// AutoMigrate creates or updates database tables based on your models
	err = db.AutoMigrate(
		&models.User{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	log.Println("Database migrated successfully")

	return db
}