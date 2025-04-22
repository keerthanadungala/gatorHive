package main

import (
	"fmt"
	"net/smtp"
)

// Email config (should use env vars in production)
var (
	smtpHost    = "smtp.gmail.com"
	smtpPort    = "587"
	senderEmail = "senderEmail@gmail.com"
	senderPass  = "senderPassword" // app-specific password
)

// Default sendEmail function (used in prod)
var sendEmail = func(to string, subject string, body string) error {
	auth := smtp.PlainAuth("", senderEmail, senderPass, smtpHost)
	msg := []byte(fmt.Sprintf("Subject: %s\r\n\r\n%s", subject, body))
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	return smtp.SendMail(addr, auth, senderEmail, []string{to}, msg)
}
