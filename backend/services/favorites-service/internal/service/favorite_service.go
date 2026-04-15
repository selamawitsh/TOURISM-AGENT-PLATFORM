package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"favorites-service/internal/config"
	"favorites-service/internal/dto"
	"favorites-service/internal/models"
	"favorites-service/internal/repository"

	"github.com/google/uuid"
)

type FavoriteService struct {
	Repo       *repository.FavoriteRepository
	Cfg        *config.Config
	HTTPClient *http.Client
}

func NewFavoriteService(repo *repository.FavoriteRepository, cfg *config.Config) *FavoriteService {
	return &FavoriteService{
		Repo:       repo,
		Cfg:        cfg,
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// getDestinationInfo fetches destination details from Destination Service
func (s *FavoriteService) getDestinationInfo(destinationID uuid.UUID) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/destinations/%s", s.Cfg.DestServiceURL, destinationID)
	
	resp, err := s.HTTPClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch destination info")
	}
	
	var destination map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&destination); err != nil {
		return nil, err
	}
	
	return destination, nil
}

// AddFavorite adds a destination to user's favorites
func (s *FavoriteService) AddFavorite(userID uuid.UUID, req dto.AddFavoriteRequest) (*dto.FavoriteResponse, error) {
	// Parse destination ID
	destID, err := uuid.Parse(req.DestinationID)
	if err != nil {
		return nil, errors.New("invalid destination ID")
	}
	
	// Check if already exists
	if s.Repo.Exists(userID, destID) {
		return nil, errors.New("destination already in favorites")
	}
	
	// Get destination info to validate existence
	destination, err := s.getDestinationInfo(destID)
	if err != nil {
		return nil, errors.New("destination not found")
	}
	
	// Create favorite
	favorite := &models.Favorite{
		UserID:        userID,
		DestinationID: destID,
	}
	
	if err := s.Repo.Create(favorite); err != nil {
		return nil, err
	}
	
	return s.toFavoriteResponse(favorite, destination), nil
}

// RemoveFavorite removes a destination from user's favorites
func (s *FavoriteService) RemoveFavorite(userID uuid.UUID, destinationID string) error {
	destID, err := uuid.Parse(destinationID)
	if err != nil {
		return errors.New("invalid destination ID")
	}
	
	// Check if exists
	if !s.Repo.Exists(userID, destID) {
		return errors.New("favorite not found")
	}
	
	return s.Repo.Delete(userID, destID)
}

// GetUserFavorites returns all favorites for a user
func (s *FavoriteService) GetUserFavorites(userID uuid.UUID) ([]dto.FavoriteResponse, int64, error) {
	favorites, err := s.Repo.FindByUserID(userID)
	if err != nil {
		return nil, 0, err
	}
	
	responses := make([]dto.FavoriteResponse, 0, len(favorites))
	for _, favorite := range favorites {
		destination, err := s.getDestinationInfo(favorite.DestinationID)
		if err != nil {
			// Skip if destination not found
			continue
		}
		responses = append(responses, *s.toFavoriteResponse(&favorite, destination))
	}
	
	return responses, int64(len(responses)), nil
}

// IsFavorite checks if a destination is in user's favorites
func (s *FavoriteService) IsFavorite(userID uuid.UUID, destinationID string) (bool, error) {
	destID, err := uuid.Parse(destinationID)
	if err != nil {
		return false, errors.New("invalid destination ID")
	}
	
	return s.Repo.Exists(userID, destID), nil
}

// toFavoriteResponse converts model to response DTO
func (s *FavoriteService) toFavoriteResponse(favorite *models.Favorite, destination map[string]interface{}) *dto.FavoriteResponse {
	destName := ""
	destCity := ""
	destCountry := ""
	destImage := ""
	destPrice := 0.0
	
	if name, ok := destination["name"].(string); ok {
		destName = name
	}
	if city, ok := destination["city"].(string); ok {
		destCity = city
	}
	if country, ok := destination["country"].(string); ok {
		destCountry = country
	}
	if image, ok := destination["main_image"].(string); ok {
		destImage = image
	}
	if price, ok := destination["price_per_person"].(float64); ok {
		destPrice = price
	}
	
	return &dto.FavoriteResponse{
		ID:                favorite.ID.String(),
		UserID:            favorite.UserID.String(),
		DestinationID:     favorite.DestinationID.String(),
		DestinationName:   destName,
		DestinationCity:   destCity,
		DestinationCountry: destCountry,
		DestinationImage:  destImage,
		DestinationPrice:  destPrice,
		CreatedAt:         favorite.CreatedAt,
	}
}