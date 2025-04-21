package main

import (
	"fmt"
	"net/smtp"
)

// Email config (use environment vars in production)
var (
	smtpHost    = "smtp.gmail.com"
	smtpPort    = "587"
	senderEmail = "gautamvarma1234k@gmail.com"
	senderPass  = "nasw bnaz advf fokx" // use app-specific password
)

func sendEmail(to string, subject string, body string) error {
	auth := smtp.PlainAuth("", senderEmail, senderPass, smtpHost)
	msg := []byte(fmt.Sprintf("Subject: %s\r\n\r\n%s", subject, body))
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	return smtp.SendMail(addr, auth, senderEmail, []string{to}, msg)
}
