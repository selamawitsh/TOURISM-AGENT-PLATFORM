package seeds

import (
	"log"

	"auth-service/internal/models"
	"auth-service/internal/utils"

	"gorm.io/gorm"
)

// SeedDatabase creates initial admin and agent accounts if they don't exist
// This runs automatically when the service starts
func SeedDatabase(db *gorm.DB) {
	// Create Admin User if not exists
	createAdminIfNotExists(db)
	
	// Create Agent User if not exists
	createAgentIfNotExists(db)
	
	log.Println("Database seeding completed")
}

func createAdminIfNotExists(db *gorm.DB) {
	// Check if admin already exists
	var admin models.User
	result := db.Where("email = ?", "admin@tourismplatform.com").First(&admin)
	
	if result.Error == nil {
		log.Println("Admin user already exists, skipping...")
		return
	}

	// Hash the default admin password
	hashedPassword, err := utils.HashPassword("Admin@123456")
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return
	}

	// Create admin user
	admin = models.User{
		FirstName:       "Super",
		LastName:        "Admin",
		Email:           "admin@tourismplatform.com",
		PasswordHash:    hashedPassword,
		Role:            models.RoleAdmin,
		IsActive:        true,
		IsEmailVerified: true, // Admin doesn't need email verification
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Printf("Failed to create admin user: %v", err)
		return
	}

	log.Println("Admin user created - Email: admin@tourismplatform.com, Password: Admin@123456")
}

func createAgentIfNotExists(db *gorm.DB) {
	// Check if agent already exists
	var agent models.User
	result := db.Where("email = ?", "agent@tourismplatform.com").First(&agent)
	
	if result.Error == nil {
		log.Println("Agent user already exists, skipping...")
		return
	}

	// Hash the default agent password
	hashedPassword, err := utils.HashPassword("Agent@123456")
	if err != nil {
		log.Printf("Failed to hash agent password: %v", err)
		return
	}

	// Create agent user
	agent = models.User{
		FirstName:       "Travel",
		LastName:        "Agent",
		Email:           "agent@tourismplatform.com",
		PasswordHash:    hashedPassword,
		Role:            models.RoleAgent,
		IsActive:        true,
		IsEmailVerified: true, // Agent accounts are created by admin, so pre-verified
	}

	if err := db.Create(&agent).Error; err != nil {
		log.Printf("Failed to create agent user: %v", err)
		return
	}

	log.Println("Agent user created - Email: agent@tourismplatform.com, Password: Agent@123456")
}