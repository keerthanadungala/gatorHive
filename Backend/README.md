## GatorHive Backend
This is the backend for the GatorHive platform, a web application for managing and organizing campus events at the University of Florida. The backend is built using Go

## Prerequisites
Before you can run the backend server, ensure that you have the following installed:

Go (1.18 or higher)
SQLite

## Email Notifications Setup
To setup the sender email and password, use the below steps:
First choose a sender email that you would like the email sent from.
If you’re using a Gmail account:
Enable 2-Step Verification on your account
👉 https://myaccount.google.com/security

Go to App Passwords
👉 https://myaccount.google.com/apppasswords

Generate an app password for “Mail” or “Other”

In the Backend/email.go file:
Replace your senderEmail.
Replace your senderPass with that generated password.


## Steps to run backend server-
`cd Backend`

`go mod tidy`

`go run main.go email.go`

## To run unit tests-
`go test -v` or `go test`
