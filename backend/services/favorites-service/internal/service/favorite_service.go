package service

import (
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

// AddFavorite adds a destination to user's favorites
func (s *FavoriteService) AddFavorite(userID uuid.UUID, req dto.AddFavoriteRequest) (*dto.FavoriteResponse, error) {
	destID, err := uuid.Parse(req.DestinationID)
	if err != nil {
		return nil, errors.New("invalid destination ID")
	}
	
	// Check if already exists
	if s.Repo.Exists(userID, destID) {
		return nil, errors.New("already in favorites")
	}
	
	// Create favorite
	favorite := &models.Favorite{
		UserID:        userID,
		DestinationID: destID,
	}
	
	if err := s.Repo.Create(favorite); err != nil {
		return nil, err
	}
	
	// Return basic response without destination details
	return &dto.FavoriteResponse{
		ID:            favorite.ID.String(),
		UserID:        favorite.UserID.String(),
		DestinationID: favorite.DestinationID.String(),
		CreatedAt:     favorite.CreatedAt,
	}, nil
}

// RemoveFavorite removes a destination from user's favorites
func (s *FavoriteService) RemoveFavorite(userID uuid.UUID, destinationID string) error {
	destID, err := uuid.Parse(destinationID)
	if err != nil {
		return errors.New("invalid destination ID")
	}
	
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
	
	fmt.Printf("Found %d favorites in database\n", len(favorites))
	
	responses := make([]dto.FavoriteResponse, 0, len(favorites))
	for _, favorite := range favorites {
		response := dto.FavoriteResponse{
			ID:            favorite.ID.String(),
			UserID:        favorite.UserID.String(),
			DestinationID: favorite.DestinationID.String(),
			DestinationName: "Destination",
			DestinationCity: "",
			DestinationCountry: "",
			DestinationImage: "",
			DestinationPrice: 0,
			CreatedAt:     favorite.CreatedAt,
		}
		responses = append(responses, response)
	}
	
	fmt.Printf("Returning %d favorites\n", len(responses))
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