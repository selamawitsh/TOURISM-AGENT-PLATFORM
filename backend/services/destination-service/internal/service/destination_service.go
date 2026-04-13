package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"destination-service/internal/dto"
	"destination-service/internal/models"
	"destination-service/internal/repository"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type DestinationService struct {
	Repo *repository.DestinationRepository
}

func NewDestinationService(repo *repository.DestinationRepository) *DestinationService {
	return &DestinationService{Repo: repo}
}

// generateSlug creates a URL-friendly slug from name
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "&", "and")
	return slug
}

// Category methods
func (s *DestinationService) CreateCategory(req dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	category := &models.Category{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
	}

	if err := s.Repo.CreateCategory(category); err != nil {
		return nil, err
	}

	return &dto.CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Description: category.Description,
		Icon:        category.Icon,
	}, nil
}

func (s *DestinationService) GetAllCategories() ([]dto.CategoryResponse, error) {
	categories, err := s.Repo.GetAllCategories()
	if err != nil {
		return nil, err
	}

	responses := make([]dto.CategoryResponse, len(categories))
	for i, cat := range categories {
		responses[i] = dto.CategoryResponse{
			ID:          cat.ID,
			Name:        cat.Name,
			Description: cat.Description,
			Icon:        cat.Icon,
		}
	}
	return responses, nil
}

// Helper to convert string slice to datatypes.JSON
func stringSliceToJSON(arr []string) datatypes.JSON {
	if len(arr) == 0 {
		return datatypes.JSON([]byte("[]"))
	}
	jsonBytes, _ := json.Marshal(arr)
	return datatypes.JSON(jsonBytes)
}

// Helper to convert datatypes.JSON to string slice
func jsonToStringSlice(jsonData datatypes.JSON) []string {
	if len(jsonData) == 0 || string(jsonData) == "[]" {
		return []string{}
	}
	var arr []string
	json.Unmarshal(jsonData, &arr)
	return arr
}

// Destination methods
func (s *DestinationService) CreateDestination(req dto.CreateDestinationRequest) (*dto.DestinationResponse, error) {
	// Generate unique slug
	baseSlug := generateSlug(req.Name)
	slug := baseSlug
	counter := 1
	for {
		existing, _ := s.Repo.GetDestinationBySlug(slug)
		if existing == nil {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	destination := &models.Destination{
		Name:             req.Name,
		Slug:             slug,
		ShortDescription: req.ShortDescription,
		Description:      req.Description,
		Country:          req.Country,
		City:             req.City,
		Address:          req.Address,
		Latitude:         req.Latitude,
		Longitude:        req.Longitude,
		PricePerPerson:   req.PricePerPerson,
		DiscountPrice:    req.DiscountPrice,
		Duration:         req.Duration,
		MaxPeople:        req.MaxPeople,
		Difficulty:       req.Difficulty,
		CategoryID:       req.CategoryID,
		Included:         stringSliceToJSON(req.Included),
		Excluded:         stringSliceToJSON(req.Excluded),
		MainImage:        req.MainImage,
		IsFeatured:       req.IsFeatured,
		IsActive:         true,
	}

	if err := s.Repo.CreateDestination(destination); err != nil {
		return nil, err
	}

	return s.toDestinationResponse(destination), nil
}

func (s *DestinationService) GetDestinationByID(id uuid.UUID) (*dto.DestinationResponse, error) {
	destination, err := s.Repo.GetDestinationByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("destination not found")
		}
		return nil, err
	}

	// Increment view count
	go s.Repo.IncrementViewCount(id)

	return s.toDestinationResponse(destination), nil
}

func (s *DestinationService) GetDestinationBySlug(slug string) (*dto.DestinationResponse, error) {
	destination, err := s.Repo.GetDestinationBySlug(slug)
	if err != nil {
		return nil, errors.New("destination not found")
	}

	// Increment view count
	go s.Repo.IncrementViewCount(destination.ID)

	return s.toDestinationResponse(destination), nil
}

func (s *DestinationService) ListDestinations(page, pageSize int) ([]dto.DestinationResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	destinations, total, err := s.Repo.GetAllDestinations(pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.DestinationResponse, len(destinations))
	for i, dest := range destinations {
		responses[i] = *s.toDestinationResponse(&dest)
	}

	return responses, total, nil
}

func (s *DestinationService) GetFeaturedDestinations(limit int) ([]dto.DestinationResponse, error) {
	if limit < 1 || limit > 20 {
		limit = 6
	}

	destinations, err := s.Repo.GetFeaturedDestinations(limit)
	if err != nil {
		return nil, err
	}

	responses := make([]dto.DestinationResponse, len(destinations))
	for i, dest := range destinations {
		responses[i] = *s.toDestinationResponse(&dest)
	}

	return responses, nil
}

func (s *DestinationService) UpdateDestination(id uuid.UUID, req dto.UpdateDestinationRequest) (*dto.DestinationResponse, error) {
	destination, err := s.Repo.GetDestinationByID(id)
	if err != nil {
		return nil, errors.New("destination not found")
	}

	if req.Name != nil {
		destination.Name = *req.Name
	}
	if req.ShortDescription != nil {
		destination.ShortDescription = *req.ShortDescription
	}
	if req.Description != nil {
		destination.Description = *req.Description
	}
	if req.Country != nil {
		destination.Country = *req.Country
	}
	if req.City != nil {
		destination.City = *req.City
	}
	if req.Address != nil {
		destination.Address = *req.Address
	}
	if req.Latitude != nil {
		destination.Latitude = *req.Latitude
	}
	if req.Longitude != nil {
		destination.Longitude = *req.Longitude
	}
	if req.PricePerPerson != nil {
		destination.PricePerPerson = *req.PricePerPerson
	}
	if req.DiscountPrice != nil {
		destination.DiscountPrice = *req.DiscountPrice
	}
	if req.Duration != nil {
		destination.Duration = *req.Duration
	}
	if req.MaxPeople != nil {
		destination.MaxPeople = *req.MaxPeople
	}
	if req.Difficulty != nil {
		destination.Difficulty = *req.Difficulty
	}
	if req.CategoryID != nil {
		destination.CategoryID = req.CategoryID
	}
	if req.Included != nil {
		destination.Included = stringSliceToJSON(req.Included)
	}
	if req.Excluded != nil {
		destination.Excluded = stringSliceToJSON(req.Excluded)
	}
	if req.MainImage != nil {
		destination.MainImage = *req.MainImage
	}
	if req.IsActive != nil {
		destination.IsActive = *req.IsActive
	}
	if req.IsFeatured != nil {
		destination.IsFeatured = *req.IsFeatured
	}

	if err := s.Repo.UpdateDestination(destination); err != nil {
		return nil, err
	}

	return s.toDestinationResponse(destination), nil
}

func (s *DestinationService) DeleteDestination(id uuid.UUID) error {
	return s.Repo.DeleteDestination(id)
}

// Helper method to convert model to response DTO
func (s *DestinationService) toDestinationResponse(dest *models.Destination) *dto.DestinationResponse {
	resp := &dto.DestinationResponse{
		ID:               dest.ID,
		Name:             dest.Name,
		Slug:             dest.Slug,
		ShortDescription: dest.ShortDescription,
		Description:      dest.Description,
		Country:          dest.Country,
		City:             dest.City,
		Address:          dest.Address,
		Latitude:         dest.Latitude,
		Longitude:        dest.Longitude,
		PricePerPerson:   dest.PricePerPerson,
		DiscountPrice:    dest.DiscountPrice,
		Duration:         dest.Duration,
		MaxPeople:        dest.MaxPeople,
		Difficulty:       dest.Difficulty,
		Included:         jsonToStringSlice(dest.Included),
		Excluded:         jsonToStringSlice(dest.Excluded),
		MainImage:        dest.MainImage,
		IsActive:         dest.IsActive,
		IsFeatured:       dest.IsFeatured,
		Rating:           dest.Rating,
		ReviewCount:      dest.ReviewCount,
		CreatedAt:        dest.CreatedAt,
		UpdatedAt:        dest.UpdatedAt,
	}

	if dest.Category != nil {
		resp.Category = &dto.CategoryResponse{
			ID:          dest.Category.ID,
			Name:        dest.Category.Name,
			Description: dest.Category.Description,
			Icon:        dest.Category.Icon,
		}
	}

	return resp
}