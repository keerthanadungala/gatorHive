package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"golang.org/x/crypto/bcrypt"
)

// Event model
type Event struct {
	gorm.Model
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Location    string    `json:"location"`
	Capacity    int       `json:"capacity"`
}

// User model
type User struct {
	gorm.Model
	Name     string `json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `json:"password"`
}

// RSVP model to record which user RSVPed to which event.
type RSVP_model struct {
	gorm.Model
	UserID  uint `json:"user_id"`
	EventID uint `json:"event_id"`
}

type WaitlistEntry struct {
	gorm.Model
	UserID  uint `json:"user_id"`
	EventID uint `json:"event_id"`
}

// Comment represents a user’s comment on an event.
type Comment struct {
	gorm.Model
	Comment string `json:"comment"`
	UserID  uint   `json:"user_id"`
	User    User   `json:"user"`
	EventID uint   `json:"event_id"`
}

// TODO: JWT secret key (change for production)
var jwtSecret = []byte("your_secret_key")

// Initialize the database
func initializeDB() (*gorm.DB, error) {
	db, err := gorm.Open("sqlite3", "./gatorhive.db")
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&Event{}, &User{}, &RSVP_model{}, &Comment{}, &WaitlistEntry{})
	return db, nil
}

// Global in-memory token blacklist.
var tokenBlacklist = make(map[string]bool)

// GetEvents returns all events along with their RSVP counts.
func GetEvents(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var events []Event
	db.Find(&events)

	// Define a response type embedding Event with an RSVPCount.
	type EventResponse struct {
		Event
		RSVPCount      int  `json:"rsvp_count"`
		Capacity       int  `json:"capacity"`
		UserHasRSVP    bool `json:"user_has_rsvp"`
		UserOnWaitlist bool `json:"user_on_waitlist"`
	}

	// Get userID from jwt
	var userID uint
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		var tokenString string
		fmt.Sscanf(authHeader, "Bearer %s", &tokenString)
		token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if uidFloat, ok := claims["user_id"].(float64); ok {
				userID = uint(uidFloat)
			}
		}
	}

	var responses []EventResponse
	for _, event := range events {
		var count int
		db.Model(&RSVP_model{}).Where("event_id = ?", event.ID).Count(&count)

		hasRSVP := false
		if userID != 0 {
			var rsvp RSVP_model
			if err := db.Where("event_id = ? AND user_id = ?", event.ID, userID).First(&rsvp).Error; err == nil {
				hasRSVP = true
			}
		}

		userOnWaitlist := false
		if userID != 0 {
			var waitlistEntry WaitlistEntry
			if err := db.Where("event_id = ? AND user_id = ?", event.ID, userID).First(&waitlistEntry).Error; err == nil {
				userOnWaitlist = true
			}
		}

		responses = append(responses, EventResponse{
			Event:          event,
			RSVPCount:      count,
			Capacity:       event.Capacity,
			UserHasRSVP:    hasRSVP,
			UserOnWaitlist: userOnWaitlist,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// Create a new event
func CreateEvent(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if event.Date.IsZero() {
		event.Date = time.Now()
	}

	if event.Capacity < 0 {
		http.Error(w, "Guest count cannot be negative", http.StatusBadRequest)
		return
	}

	db.Create(&event)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// Update an existing event
func UpdateEvent(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	vars := mux.Vars(r)
	eventID := vars["id"]

	var event Event
	if err := db.First(&event, eventID).Error; err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	var updatedEvent Event
	err := json.NewDecoder(r.Body).Decode(&updatedEvent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if updatedEvent.Capacity < 0 {
		http.Error(w, "Guest count cannot be negative", http.StatusBadRequest)
		return
	}

	event.Title = updatedEvent.Title
	event.Description = updatedEvent.Description
	event.Date = updatedEvent.Date
	event.Location = updatedEvent.Location
	event.Capacity = updatedEvent.Capacity

	db.Save(&event)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// Delete an event
func DeleteEvent(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	vars := mux.Vars(r)
	eventID := vars["id"]

	var event Event
	if err := db.First(&event, eventID).Error; err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	db.Delete(&event)

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Event deleted successfully"})
}

// Authentication Handlers

// SignUp handles new user registration.
func SignUp(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	// We can decode a separate struct that includes confirmPassword
	var reqData struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(reqData.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create the user record
	user := User{
		Name:     reqData.Name,
		Email:    reqData.Email,
		Password: string(hashedPassword),
	}

	if err := db.Create(&user).Error; err != nil {
		// e.g., unique constraint error if email already exists
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

// Login handles user login and returns a JWT token.
func Login(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var reqData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user User
	// Look up by email
	if err := db.Where("email = ?", reqData.Email).First(&user).Error; err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Compare the hashed password with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqData.Password)); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Create JWT token (example)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret) // Ensure jwtSecret is defined
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// Logout invalidates the current JWT token by first verifying it and then adding it to the blacklist.
func Logout(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusBadRequest)
		return
	}

	// Expect header in the format "Bearer <token>"
	var tokenString string
	_, err := fmt.Sscanf(authHeader, "Bearer %s", &tokenString)
	if err != nil || tokenString == "" {
		http.Error(w, "Invalid token format", http.StatusBadRequest)
		return
	}

	// Validate the token using the JWT secret.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Make sure that the signing method is HMAC.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// If valid, add the token to the blacklist.
	tokenBlacklist[tokenString] = true

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logout successful"})
}

// RSVP allows a logged-in user to RSVP to an event,
// but also requires that the email provided in the request body matches
// the email of the logged-in user (as determined from the JWT token).
func RSVP(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	// Get the event ID from the URL.
	vars := mux.Vars(r)
	eventID := vars["id"]

	// Verify that the event exists.
	var event Event
	if err := db.First(&event, eventID).Error; err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	// Extract token from the Authorization header.
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusBadRequest)
		return
	}
	var tokenString string
	_, err := fmt.Sscanf(authHeader, "Bearer %s", &tokenString)
	if err != nil || tokenString == "" {
		http.Error(w, "Invalid token format", http.StatusBadRequest)
		return
	}

	// Validate the token.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Retrieve the user_id from the token claims.
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "user_id not found in token", http.StatusUnauthorized)
		return
	}
	userID := uint(userIDFloat)

	// Look up the user in the database.
	var user User
	if err := db.First(&user, userID).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Decode the request body to get the email provided by the client.
	var reqData struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if reqData.Email == "" {
		http.Error(w, "Email is required in the request body", http.StatusBadRequest)
		return
	}

	// Compare the email in the request with the email from the user record.
	if reqData.Email != user.Email {
		http.Error(w, "Email in request does not match logged-in user's email", http.StatusUnauthorized)
		return
	}

	// Check if an RSVP already exists for this user and event.
	var existing RSVP_model
	if err := db.Where("user_id = ? AND event_id = ?", user.ID, event.ID).First(&existing).Error; err == nil {
		var count int
		db.Model(&RSVP_model{}).Where("event_id = ?", event.ID).Count(&count)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":    "Already RSVPed",
			"rsvp_count": count,
		})
		return
	}

	// Check if event is full
	var rsvpCount int
	db.Model(&RSVP_model{}).Where("event_id = ?", event.ID).Count(&rsvpCount)
	if rsvpCount >= event.Capacity {
		http.Error(w, "Event is full. Join the waitlist instead.", http.StatusForbidden)
		return
	}

	// Proceed to create RSVP
	newRSVP := RSVP_model{
		UserID:  user.ID,
		EventID: event.ID,
	}
	if err := db.Create(&newRSVP).Error; err != nil {
		http.Error(w, "Failed to create RSVP", http.StatusInternalServerError)
		return
	}

	go func() {
		subject := "RSVP Confirmation - " + event.Title
		body := fmt.Sprintf("Hi %s,\n\nYou've successfully RSVPed for the event: \"%s\" on %s at %s.\nWe're excited to see you there!\nThanks,\nGatorHive Team",
			user.Name, event.Title, event.Date.Format("02 Jan 2006 15:04"), event.Location)

		if err := sendEmail(user.Email, subject, body); err != nil {
			log.Printf("Failed to send RSVP email: %v", err)
		}
	}()

	// Count total RSVPs for the event.
	var count int
	db.Model(&RSVP_model{}).Where("event_id = ?", event.ID).Count(&count)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "RSVP successful",
		"rsvp_count": count,
	})
}

// CancelRSVP allows a logged-in user to cancel their RSVP for an event.
func CancelRSVP(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	// Get the event ID from the URL.
	vars := mux.Vars(r)
	eventID := vars["id"]

	// Verify that the event exists.
	var event Event
	if err := db.First(&event, eventID).Error; err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	// Extract token from the Authorization header.
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusBadRequest)
		return
	}
	var tokenString string
	_, err := fmt.Sscanf(authHeader, "Bearer %s", &tokenString)
	if err != nil || tokenString == "" {
		http.Error(w, "Invalid token format", http.StatusBadRequest)
		return
	}

	// Validate the token.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Retrieve the user_id from the token claims.
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "user_id not found in token", http.StatusUnauthorized)
		return
	}
	userID := uint(userIDFloat)

	// Look up the user in the database.
	var user User
	if err := db.First(&user, userID).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Check if an RSVP already exists for this user and event.
	var existing RSVP_model
	if err := db.Where("user_id = ? AND event_id = ?", user.ID, event.ID).First(&existing).Error; err != nil {
		http.Error(w, "RSVP not found", http.StatusNotFound)
		return
	}

	// Delete the RSVP record.
	if err := db.Delete(&existing).Error; err != nil {
		http.Error(w, "Failed to cancel RSVP", http.StatusInternalServerError)
		return
	}

	// Send cancellation email in background
	go func() {
		subject := "RSVP Cancellation – " + event.Title
		body := fmt.Sprintf("Hi %s,\n\nYou've successfully cancelled your RSVP for the event: \"%s\" scheduled on %s at %s.\n\nWe hope to see you at future events!\n\n- GatorHive Team",
			user.Name, event.Title, event.Date.Format("02 Jan 2006 15:04"), event.Location)

		if err := sendEmail(user.Email, subject, body); err != nil {
			log.Printf("Error sending RSVP cancellation email: %v", err)
		}
	}()

	// Try promoting the first waitlisted user
	var nextInLine WaitlistEntry
	if err := db.Where("event_id = ?", event.ID).Order("created_at asc").First(&nextInLine).Error; err == nil {
		// Create RSVP
		newRSVP := RSVP_model{UserID: nextInLine.UserID, EventID: nextInLine.EventID}
		db.Create(&newRSVP)
		// Remove from waitlist
		db.Delete(&nextInLine)
	}

	// Count total RSVPs for the event.
	var count int
	db.Model(&RSVP_model{}).Where("event_id = ?", event.ID).Count(&count)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "RSVP canceled successfully",
		"rsvp_count": count,
	})
}

func JoinWaitlist(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	vars := mux.Vars(r)
	eventID := vars["id"]

	var event Event
	if err := db.First(&event, eventID).Error; err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	var tokenString string
	authHeader := r.Header.Get("Authorization")
	fmt.Sscanf(authHeader, "Bearer %s", &tokenString)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	claims := token.Claims.(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	var input struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Prevent duplicates
	var existing WaitlistEntry
	if err := db.Where("user_id = ? AND event_id = ?", userID, event.ID).First(&existing).Error; err == nil {
		http.Error(w, "Already in waitlist", http.StatusBadRequest)
		return
	}

	entry := WaitlistEntry{UserID: userID, EventID: event.ID}
	if err := db.Create(&entry).Error; err != nil {
		http.Error(w, "Failed to join waitlist", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Added to waitlist",
	})
}

//COMMENTS FEATURE

// CreateComment lets a user post a comment.
func CreateComment(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	// 1. Extract event ID
	eventID := mux.Vars(r)["id"]
	var ev Event
	if db.First(&ev, eventID).RecordNotFound() {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	// 2. Extract & validate the JWT token
	auth := r.Header.Get("Authorization")
	if auth == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}
	var tokenString string
	fmt.Sscanf(auth, "Bearer %s", &tokenString)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	claims := token.Claims.(jwt.MapClaims)
	userIDf, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "user_id missing in token", http.StatusUnauthorized)
		return
	}
	userID := uint(userIDf)

	// 3. Look up the user to get their Name
	var u User
	if db.First(&u, userID).RecordNotFound() {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// 4. Decode only the comment content from the body
	var in struct {
		Comment string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 5. Create the comment
	c := Comment{
		Comment: in.Comment,
		UserID:  u.ID,
		EventID: ev.ID,
	}
	if err := db.Create(&c).Error; err != nil {
		http.Error(w, "Failed to save comment", http.StatusInternalServerError)
		return
	}

	// 6. Reload with User association so we return the username
	db.Preload("User").First(&c, c.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}

// GetComments returns all comments for an event.
func GetComments(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	eventID := mux.Vars(r)["id"]
	var comments []Comment
	db.
		Preload("User").
		Where("event_id = ?", eventID).
		Order("created_at asc").
		Find(&comments)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// DeleteComment removes a comment by its ID, without any auth checks.
func DeleteComment(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	commentID := mux.Vars(r)["id"]

	if err := db.Delete(&Comment{}, commentID).Error; err != nil {
		http.Error(w, "Failed to delete comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Comment deleted"})
}

func main() {
	db, err := initializeDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create router and routes
	r := mux.NewRouter()
	r.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) { GetEvents(w, r, db) }).Methods("GET")
	r.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) { CreateEvent(w, r, db) }).Methods("POST")
	r.HandleFunc("/events/{id}", func(w http.ResponseWriter, r *http.Request) { UpdateEvent(w, r, db) }).Methods("PUT")
	r.HandleFunc("/events/{id}", func(w http.ResponseWriter, r *http.Request) { DeleteEvent(w, r, db) }).Methods("DELETE")

	// RSVP route.
	r.HandleFunc("/events/{id}/rsvp", func(w http.ResponseWriter, r *http.Request) { RSVP(w, r, db) }).Methods("POST")
	// Cancel RSVP route.
	r.HandleFunc("/events/{id}/cancel-rsvp", func(w http.ResponseWriter, r *http.Request) { CancelRSVP(w, r, db) }).Methods("POST")
	// Waitlist route
	r.HandleFunc("/events/{id}/waitlist", func(w http.ResponseWriter, r *http.Request) {
		JoinWaitlist(w, r, db)
	}).Methods("POST")

	// Authentication routes.
	r.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) { SignUp(w, r, db) }).Methods("POST")
	r.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) { Login(w, r, db) }).Methods("POST")
	r.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		// No need to open DB here since logout only uses tokenBlacklist.
		Logout(w, r, nil)
	}).Methods("POST")

	// Comment routes.
	r.HandleFunc("/events/{id}/comments", func(w http.ResponseWriter, r *http.Request) { CreateComment(w, r, db) }).Methods("POST")
	r.HandleFunc("/events/{id}/comments", func(w http.ResponseWriter, r *http.Request) { GetComments(w, r, db) }).Methods("GET")
	r.HandleFunc("/comments/{id}", func(w http.ResponseWriter, r *http.Request) { DeleteComment(w, r, db) }).Methods("DELETE")

	// Enable CORS for React frontend
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	origins := handlers.AllowedOrigins([]string{"http://localhost:5173"})

	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(origins, methods, headers)(r)))
	log.Fatal(http.ListenAndServe(":8080", r))
}
