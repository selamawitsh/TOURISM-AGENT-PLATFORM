package service

import (
	"fmt"
	"log"
	"os"

	"github.com/wneessen/go-mail"
)

// SendVerificationEmail sends an email verification link using go-mail
func (s *AuthService) SendVerificationEmail(to, token, frontendURL string) error {
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", frontendURL, token)

	// Get SMTP configuration from environment
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpFrom := os.Getenv("SMTP_FROM")
	smtpPassword := os.Getenv("SMTP_PASSWORD")

	// If no SMTP config, just log (development mode)
	if smtpHost == "" || smtpPassword == "" {
		log.Printf("📧 [DEV MODE] Verification email would be sent to: %s", to)
		log.Printf("🔗 [DEV MODE] Verification link: %s", verificationURL)
		return nil
	}

	port := 587
	if smtpPort != "" {
		port = 587 // Default for Gmail
	}

	// Create a new message
	message := mail.NewMsg()

	// Set sender (From)
	if err := message.From(smtpFrom); err != nil {
		log.Printf("❌ Failed to set From address: %v", err)
		return err
	}

	// Set recipient (To)
	if err := message.To(to); err != nil {
		log.Printf("❌ Failed to set To address: %v", err)
		return err
	}

	// Set subject
	message.Subject("Verify Your Email - Tourism Platform")

	// Set HTML body
	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>Verify Your Email</title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0284c7, #38bdf8); border-radius: 16px 16px 0 0; }
				.header h1 { color: white; margin: 0; }
				.content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; }
				.button { display: inline-block; padding: 14px 32px; background: #0284c7; color: white; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; }
				.link { word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; }
				.footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🌍 Tourism Platform</h1>
				</div>
				<div class="content">
					<h2>Welcome to Tourism Platform!</h2>
					<p>Thank you for registering. Please verify your email address to get started.</p>
					<div style="text-align: center;">
						<a href="%s" class="button">Verify Email Address</a>
					</div>
					<p>Or copy and paste this link:</p>
					<p class="link">%s</p>
					<p><strong>⚠️ This link will expire in 24 hours.</strong></p>
					<hr />
					<p style="font-size: 14px; color: #64748b;">
						If you didn't create an account, please ignore this email.
					</p>
				</div>
				<div class="footer">
					<p>&copy; 2024 Tourism Platform. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, verificationURL, verificationURL)

	message.SetBodyString(mail.TypeTextHTML, htmlBody)

	// Also add plain text alternative
	plainBody := fmt.Sprintf(`
Welcome to Tourism Platform!

Thank you for registering. Please verify your email address by visiting this link:
%s

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

---
Tourism Platform Team
	`, verificationURL)

	message.SetBodyString(mail.TypeTextPlain, plainBody)

	// Create SMTP client
	client, err := mail.NewClient(
		smtpHost,
		mail.WithPort(port),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(smtpFrom),
		mail.WithPassword(smtpPassword),
		mail.WithTLSPolicy(mail.TLSMandatory),
	)
	if err != nil {
		log.Printf("❌ Failed to create mail client: %v", err)
		return err
	}

	// Send the email
	if err := client.DialAndSend(message); err != nil {
		log.Printf("❌ Failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("✅ Verification email sent to %s", to)
	return nil
}

// SendPasswordResetEmail sends a password reset link using go-mail
func (s *AuthService) SendPasswordResetEmail(to, token, frontendURL string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, token)

	smtpHost := os.Getenv("SMTP_HOST")
	smtpFrom := os.Getenv("SMTP_FROM")
	smtpPassword := os.Getenv("SMTP_PASSWORD")

	// Development mode - just log
	if smtpHost == "" || smtpPassword == "" {
		log.Printf("📧 [DEV MODE] Password reset email would be sent to: %s", to)
		log.Printf("🔗 [DEV MODE] Reset link: %s", resetURL)
		return nil
	}

	port := 587

	// Create a new message
	message := mail.NewMsg()

	if err := message.From(smtpFrom); err != nil {
		return err
	}

	if err := message.To(to); err != nil {
		return err
	}

	message.Subject("Reset Your Password - Tourism Platform")

	// HTML email body
	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>Reset Your Password</title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0284c7, #38bdf8); border-radius: 16px 16px 0 0; }
				.header h1 { color: white; margin: 0; }
				.content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; }
				.button { display: inline-block; padding: 14px 32px; background: #0284c7; color: white; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; }
				.warning { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; color: #92400e; border-left: 4px solid #f59e0b; }
				.link { word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; }
				.footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🔐 Tourism Platform</h1>
				</div>
				<div class="content">
					<h2>Password Reset Request</h2>
					<p>We received a request to reset your password. Click the button below to create a new password:</p>
					<div style="text-align: center;">
						<a href="%s" class="button">Reset Password</a>
					</div>
					<p>Or copy and paste this link:</p>
					<p class="link">%s</p>
					<div class="warning">
						<strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
					</div>
					<hr />
					<p style="font-size: 14px; color: #64748b;">
						For security reasons, do not share this link with anyone.
					</p>
				</div>
				<div class="footer">
					<p>&copy; 2024 Tourism Platform. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, resetURL, resetURL)

	message.SetBodyString(mail.TypeTextHTML, htmlBody)

	// Plain text alternative
	plainBody := fmt.Sprintf(`
Password Reset Request

We received a request to reset your password. Visit this link to create a new password:
%s

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

For security reasons, do not share this link with anyone.

---
Tourism Platform Team
	`, resetURL)

	message.SetBodyString(mail.TypeTextPlain, plainBody)

	// Create SMTP client
	client, err := mail.NewClient(
		smtpHost,
		mail.WithPort(port),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(smtpFrom),
		mail.WithPassword(smtpPassword),
		mail.WithTLSPolicy(mail.TLSMandatory),
	)
	if err != nil {
		log.Printf("❌ Failed to create mail client: %v", err)
		return err
	}

	if err := client.DialAndSend(message); err != nil {
		log.Printf("❌ Failed to send password reset email to %s: %v", to, err)
		return err
	}

	log.Printf("✅ Password reset email sent to %s", to)
	return nil
}