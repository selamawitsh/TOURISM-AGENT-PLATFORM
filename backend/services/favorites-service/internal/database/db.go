package database

import (
	"log"

	"favorites-service/internal/config"
	"favorites-service/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("✅ Database connected successfully")

	// Auto migrate all models
	err = db.AutoMigrate(
		&models.Favorite{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	log.Println("✅ Database migrated successfully")

	return db
}