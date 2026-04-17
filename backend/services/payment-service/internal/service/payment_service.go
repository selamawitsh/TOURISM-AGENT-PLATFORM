package service

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"payment-service/internal/config"
	"payment-service/internal/dto"
	"payment-service/internal/models"
	"payment-service/internal/repository"

	"github.com/google/uuid"
)

type PaymentService struct {
	Repo       *repository.PaymentRepository
	Cfg        *config.Config
	HTTPClient *http.Client
}

func NewPaymentService(repo *repository.PaymentRepository, cfg *config.Config) *PaymentService {
	return &PaymentService{
		Repo:       repo,
		Cfg:        cfg,
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// generateTransactionRef creates a unique transaction reference
func generateTransactionRef() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// getBookingInfo fetches booking details from Booking Service
func (s *PaymentService) getBookingInfo(bookingID uuid.UUID) (map[string]interface{}, error) {
    // Use the public endpoint we just created
    url := fmt.Sprintf("%s/api/v1/bookings/public/%s", s.Cfg.BookingServiceURL, bookingID)
    
    fmt.Printf("Fetching booking from: %s\n", url)
    
    resp, err := s.HTTPClient.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("failed to fetch booking info: status %d", resp.StatusCode)
    }
    
    var booking map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&booking); err != nil {
        return nil, err
    }
    
    return booking, nil
}
// getUserInfo fetches user details from User Service
func (s *PaymentService) getUserInfo(userID uuid.UUID, token string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/users/%s", s.Cfg.UserServiceURL, userID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch user info")
	}
	
	var user map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	
	return user, nil
}

// InitializePayment creates a payment request and returns Chapa checkout URL
func (s *PaymentService) InitializePayment(userID uuid.UUID, token string, req dto.InitializePaymentRequest) (*dto.PaymentResponse, error) {
	// Parse booking ID
	bookingID, err := uuid.Parse(req.BookingID)
	if err != nil {
		return nil, errors.New("invalid booking ID")
	}
	
	// Get booking details
	booking, err := s.getBookingInfo(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}
	
	// Get user details
	user, err := s.getUserInfo(userID, token)
	if err != nil {
		return nil, errors.New("user not found")
	}
	
	// Check if payment already exists for this booking
	existing, _ := s.Repo.FindByBookingID(bookingID)
	if existing != nil && existing.Status == models.StatusSuccess {
		return nil, errors.New("booking already paid")
	}
	
	// Extract booking details
	totalPrice, ok := booking["total_price"].(float64)
	if !ok {
		return nil, errors.New("invalid booking amount")
	}
	
	destinationName := ""
	if dest, ok := booking["destination_name"].(string); ok {
		destinationName = dest
	}
	
	userEmail := fmt.Sprintf("%v", user["email"])
	userFirstName := fmt.Sprintf("%v", user["first_name"])
	userLastName := fmt.Sprintf("%v", user["last_name"])
	
	// Generate unique transaction reference
	txRef := generateTransactionRef()
	
	// Create payment record
	payment := &models.Payment{
		UserID:         userID,
		BookingID:      bookingID,
		TransactionRef: txRef,
		Amount:         totalPrice,
		Currency:       "ETB",
		Status:         models.StatusPending,
		PaymentMethod:  models.MethodChapa,
	}
	
	if err := s.Repo.Create(payment); err != nil {
		return nil, err
	}
	
	// Prepare Chapa API request with shortened text
	callbackURL := fmt.Sprintf("%s/payment/confirmation?tx_ref=%s", s.Cfg.FrontendURL, txRef)
	
	// Shorten title (max 16 chars)
	shortTitle := "Tourism Payment"
	
	// Shorten description (max 50 chars)
	shortDescription := fmt.Sprintf("Payment for %s", destinationName)
	if len(shortDescription) > 50 {
		shortDescription = shortDescription[:47] + "..."
	}
	
	chapaRequest := map[string]interface{}{
		"amount":        totalPrice,
		"currency":      "ETB",
		"email":         userEmail,
		"first_name":    userFirstName,
		"last_name":     userLastName,
		"tx_ref":        txRef,
		"callback_url":  callbackURL,
		"return_url":    callbackURL,
		"customization": map[string]string{
			"title":       shortTitle,
			"description": shortDescription,
		},
	}
	
	jsonData, err := json.Marshal(chapaRequest)
	if err != nil {
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, errors.New("failed to prepare payment request")
	}
	
	// Make request to Chapa API
	chapaURL := "https://api.chapa.co/v1/transaction/initialize"
	
	httpReq, err := http.NewRequest("POST", chapaURL, bytes.NewBuffer(jsonData))
	if err != nil {
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, errors.New("failed to create payment request")
	}
	
	httpReq.Header.Set("Authorization", "Bearer "+s.Cfg.ChapaSecretKey)
	httpReq.Header.Set("Content-Type", "application/json")
	
	resp, err := s.HTTPClient.Do(httpReq)
	if err != nil {
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, fmt.Errorf("failed to connect to payment gateway: %v", err)
	}
	defer resp.Body.Close()
	
	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	
	fmt.Printf("Chapa Response Status: %d\n", resp.StatusCode)
	fmt.Printf("Chapa Response Body: %s\n", string(body))
	
	// Parse as generic map to handle different response formats
	var rawResponse map[string]interface{}
	if err := json.Unmarshal(body, &rawResponse); err != nil {
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, fmt.Errorf("failed to parse payment response: %v", err)
	}
	
	// Check if the response indicates success
	status, ok := rawResponse["status"].(string)
	if !ok || status != "success" {
		message := "Payment initialization failed"
		if msg, ok := rawResponse["message"].(string); ok {
			message = msg
		}
		// If message is an object, convert to string
		if msgMap, ok := rawResponse["message"].(map[string]interface{}); ok {
			message = fmt.Sprintf("%v", msgMap)
		}
		s.Repo.UpdateStatus(payment.ID, models.StatusFailed, nil)
		return nil, fmt.Errorf("payment initialization failed: %s", message)
	}
	
	// Extract checkout URL
	checkoutURL := ""
	if data, ok := rawResponse["data"].(map[string]interface{}); ok {
		if url, ok := data["checkout_url"].(string); ok {
			checkoutURL = url
		}
	}
	
	// Update payment with Chapa response
	if checkoutURL != "" {
		payment.PaymentURL = checkoutURL
		s.Repo.Update(payment)
	}
	
	return &dto.PaymentResponse{
		ID:             payment.ID.String(),
		TransactionRef: payment.TransactionRef,
		Amount:         payment.Amount,
		Currency:       payment.Currency,
		Status:         string(payment.Status),
		PaymentURL:     payment.PaymentURL,
		CreatedAt:      payment.CreatedAt,
	}, nil
}

// VerifyPayment verifies payment status with Chapa
func (s *PaymentService) VerifyPayment(transactionRef string) (*dto.PaymentStatusResponse, error) {
	payment, err := s.Repo.FindByTransactionRef(transactionRef)
	if err != nil {
		return nil, errors.New("payment not found")
	}
	
	// Verify with Chapa API
	chapaURL := fmt.Sprintf("https://api.chapa.co/v1/transaction/verify/%s", transactionRef)
	
	req, err := http.NewRequest("GET", chapaURL, nil)
	if err != nil {
		return nil, errors.New("failed to create verification request")
	}
	
	req.Header.Set("Authorization", "Bearer "+s.Cfg.ChapaSecretKey)
	
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return nil, errors.New("failed to verify payment")
	}
	defer resp.Body.Close()
	
	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read verification response: %v", err)
	}
	
	fmt.Printf("Chapa Verify Response: %s\n", string(body))
	
	// Parse as generic map
	var rawResponse map[string]interface{}
	if err := json.Unmarshal(body, &rawResponse); err != nil {
		return nil, fmt.Errorf("failed to parse verification response: %v", err)
	}
	
	now := time.Now()
	
	// Check status
	status, ok := rawResponse["status"].(string)
	if ok && status == "success" {
		// Check data status
		if data, ok := rawResponse["data"].(map[string]interface{}); ok {
			if txStatus, ok := data["status"].(string); ok && txStatus == "success" {
				payment.Status = models.StatusSuccess
				payment.PaidAt = &now
			} else {
				payment.Status = models.StatusFailed
			}
		} else {
			// If no data field, assume success
			payment.Status = models.StatusSuccess
			payment.PaidAt = &now
		}
	} else {
		payment.Status = models.StatusFailed
	}
	
	s.Repo.Update(payment)
	
	return &dto.PaymentStatusResponse{
		ID:             payment.ID.String(),
		TransactionRef: payment.TransactionRef,
		BookingID:      payment.BookingID.String(),
		Amount:         payment.Amount,
		Status:         string(payment.Status),
		PaidAt:         payment.PaidAt,
	}, nil
}
// HandleWebhook processes Chapa webhook notifications
func (s *PaymentService) HandleWebhook(payload dto.ChapaWebhookPayload) error {
	payment, err := s.Repo.FindByTransactionRef(payload.TransactionRef)
	if err != nil {
		return errors.New("payment not found")
	}
	
	now := time.Now()
	
	if payload.Status == "success" {
		payment.Status = models.StatusSuccess
		payment.PaidAt = &now
		payment.ChapaTxRef = payload.TxRef
		
		// Update booking status via Booking Service
		go s.updateBookingStatus(payment.BookingID, "confirmed")
		
		// Send confirmation email
		go s.sendPaymentConfirmationEmail(payment)
		
		// Generate invoice
		go s.generateInvoice(payment)
	} else if payload.Status == "failed" {
		payment.Status = models.StatusFailed
	}
	
	return s.Repo.Update(payment)
}

// updateBookingStatus updates the booking status in Booking Service
func (s *PaymentService) updateBookingStatus(bookingID uuid.UUID, status string) {
	url := fmt.Sprintf("%s/api/v1/admin/bookings/%s/status", s.Cfg.BookingServiceURL, bookingID)
	
	data := map[string]string{"status": status}
	jsonData, _ := json.Marshal(data)
	
	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	s.HTTPClient.Do(req)
}

// sendPaymentConfirmationEmail sends email confirmation
func (s *PaymentService) sendPaymentConfirmationEmail(payment *models.Payment) {
	// This will be implemented when we add email service
	fmt.Printf("Sending payment confirmation email for payment %s\n", payment.ID)
}

// generateInvoice generates PDF invoice
func (s *PaymentService) generateInvoice(payment *models.Payment) {
	// This will be implemented when we add PDF generation
	fmt.Printf("Generating invoice for payment %s\n", payment.ID)
}

// GetPaymentStatus returns payment status
func (s *PaymentService) GetPaymentStatus(transactionRef string, userID uuid.UUID, isAdmin bool) (*dto.PaymentStatusResponse, error) {
	payment, err := s.Repo.FindByTransactionRef(transactionRef)
	if err != nil {
		return nil, errors.New("payment not found")
	}
	
	// Check permission
	if !isAdmin && payment.UserID != userID {
		return nil, errors.New("unauthorized")
	}
	
	return &dto.PaymentStatusResponse{
		ID:             payment.ID.String(),
		TransactionRef: payment.TransactionRef,
		BookingID:      payment.BookingID.String(),
		Amount:         payment.Amount,
		Status:         string(payment.Status),
		PaidAt:         payment.PaidAt,
	}, nil
}

