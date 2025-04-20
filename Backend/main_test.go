package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

// Global test database instance
var testDB *gorm.DB

// Setup test database before running tests
func TestMain(m *testing.M) {
	var err error
	testDB, err = gorm.Open("sqlite3", ":memory:") // In-memory DB for testing
	if err != nil {
		log.Fatalf("failed to connect to test database: %v", err)
	}
	// AutoMigrate both Event and User models.
	testDB.AutoMigrate(&Event{}, &User{}, &RSVP_model{}, &Comment{})

	code := m.Run()

	testDB.Close()
	os.Exit(code)
}

// Helper: generate a JWT token for a given user ID.
func generateToken(userID uint) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	return token.SignedString(jwtSecret)
}

// Handler wrappers that pass testDB to handlers.
func getEventsHandler(w http.ResponseWriter, r *http.Request) {
	// Assuming your production handlers are refactored to accept a *gorm.DB parameter.
	GetEvents(w, r, testDB)
}

func createEventHandler(w http.ResponseWriter, r *http.Request) {
	CreateEvent(w, r, testDB)
}

func updateEventHandler(w http.ResponseWriter, r *http.Request) {
	UpdateEvent(w, r, testDB)
}

func deleteEventHandler(w http.ResponseWriter, r *http.Request) {
	DeleteEvent(w, r, testDB)
}

func signUpHandler(w http.ResponseWriter, r *http.Request) {
	SignUp(w, r, testDB)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	Login(w, r, testDB)
}

func rsvpHandler(w http.ResponseWriter, r *http.Request) {
	RSVP(w, r, testDB)
}

func createCommentHandler(w http.ResponseWriter, r *http.Request) {
	CreateComment(w, r, testDB)
}

// Testing GET /events
func TestGetEvents(t *testing.T) {
	// Seed test data.
	testDB.Create(&Event{Title: "Mock Event", Description: "Test", Location: "Test Location"})

	req, _ := http.NewRequest("GET", "/events", nil)
	rr := httptest.NewRecorder()

	r := mux.NewRouter()
	r.HandleFunc("/events", getEventsHandler).Methods("GET")

	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "Mock Event")
}

// Testing POST /events
func TestCreateEvent(t *testing.T) {
	event := Event{
		Title:       "Test Event",
		Description: "A test event",
		Location:    "Campus Hall",
	}

	eventJSON, _ := json.Marshal(event)
	req, _ := http.NewRequest("POST", "/events", bytes.NewBuffer(eventJSON))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	r := mux.NewRouter()
	r.HandleFunc("/events", createEventHandler).Methods("POST")

	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var createdEvent Event
	json.Unmarshal(rr.Body.Bytes(), &createdEvent)

	assert.Equal(t, "Test Event", createdEvent.Title)
}

// Testing PUT /events/{id}
func TestUpdateEvent(t *testing.T) {
	// Seed mock data
	initialEvent := Event{Title: "Initial Event", Description: "Initial Description", Location: "Old Location"}
	testDB.Create(&initialEvent)

	updatedEvent := Event{
		Title:       "Updated Event",
		Description: "Updated Description",
		Location:    "New Location",
	}

	updatedEventJSON, _ := json.Marshal(updatedEvent)

	updateReq, _ := http.NewRequest("PUT", fmt.Sprintf("/events/%d", initialEvent.ID), bytes.NewBuffer(updatedEventJSON))
	updateReq.Header.Set("Content-Type", "application/json")

	updateRR := httptest.NewRecorder()

	r := mux.NewRouter()
	r.HandleFunc("/events/{id}", updateEventHandler).Methods("PUT")

	r.ServeHTTP(updateRR, updateReq)

	assert.Equal(t, http.StatusOK, updateRR.Code)

	var updatedResponse Event
	json.Unmarshal(updateRR.Body.Bytes(), &updatedResponse)

	assert.Equal(t, "Updated Event", updatedResponse.Title)
}

// Testing DELETE /events/{id}
func TestDeleteEvent(t *testing.T) {
	// Seed mock data
	eventToDelete := Event{Title: "Event to Delete", Description: "This event will be deleted", Location: "Nowhere"}
	testDB.Create(&eventToDelete)

	deleteReq, _ := http.NewRequest("DELETE", fmt.Sprintf("/events/%d", eventToDelete.ID), nil)
	deleteRR := httptest.NewRecorder()

	r := mux.NewRouter()
	r.HandleFunc("/events/{id}", deleteEventHandler).Methods("DELETE")

	r.ServeHTTP(deleteRR, deleteReq)

	assert.Equal(t, http.StatusOK, deleteRR.Code)
	assert.Contains(t, deleteRR.Body.String(), "Event deleted successfully")
}

// Testing POST /signup
func TestSignUp(t *testing.T) {
	// Generate a unique email for testing.
	email := fmt.Sprintf("testuser_%d@ufl.edu", time.Now().UnixNano())

	reqData := map[string]string{
		"name":     "Test User",
		"email":    email,
		"password": "testpassword",
	}
	reqJSON, err := json.Marshal(reqData)
	if err != nil {
		t.Fatalf("failed to marshal request data: %v", err)
	}

	req, err := http.NewRequest("POST", "/signup", bytes.NewBuffer(reqJSON))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	router.HandleFunc("/signup", signUpHandler).Methods("POST")
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code, "Expected 200 OK on signup")

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	assert.Equal(t, "User created successfully", resp["message"])

	// Clean up: delete the test user after the test completes.
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM users WHERE email = ?", email)
	})
}

// Testing POST /login.
func TestLogin(t *testing.T) {
	// Generate a unique email for testing.
	email := fmt.Sprintf("testuser2_%d@ufl.edu", time.Now().UnixNano())
	password := "testpassword"

	// Create a hashed password for the test user.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	// Ensure any previous user with this email is removed.
	testDB.Exec("DELETE FROM users WHERE email = ?", email)

	// Create the test user.
	user := User{
		Name:     "Test User",
		Email:    email,
		Password: string(hashedPassword),
	}
	if err := testDB.Create(&user).Error; err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	reqData := map[string]string{
		"email":    email,
		"password": password,
	}
	reqJSON, err := json.Marshal(reqData)
	if err != nil {
		t.Fatalf("failed to marshal login request: %v", err)
	}

	req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(reqJSON))
	if err != nil {
		t.Fatalf("failed to create login request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	router.HandleFunc("/login", loginHandler).Methods("POST")
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code, "Expected 200 OK on login")

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal login response: %v", err)
	}
	token, exists := resp["token"]
	assert.True(t, exists, "expected token in response")
	assert.NotEmpty(t, token, "token should not be empty")

	// Clean up: delete the test user after the test completes.
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM users WHERE email = ?", email)
	})
}

func TestLogout(t *testing.T) {
	// Generate a valid token.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	// Create an HTTP request for POST /logout with the token in the Authorization header.
	req, err := http.NewRequest("POST", "/logout", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))

	rr := httptest.NewRecorder()

	// Create a router and register the logout handler.
	router := mux.NewRouter()
	// Logout doesn't use the DB, so we pass nil.
	router.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		Logout(w, r, nil)
	}).Methods("POST")
	router.ServeHTTP(rr, req)

	// Assert that the response code is 200 OK.
	assert.Equal(t, http.StatusOK, rr.Code, "Expected 200 OK, got %v", rr.Code)

	// Decode the response body.
	var resp map[string]string
	err = json.NewDecoder(rr.Body).Decode(&resp)
	if err != nil {
		t.Fatalf("failed to decode response: %v; response body: %s", err, rr.Body.String())
	}

	// Assert that the response message is "Logout successful".
	assert.Equal(t, "Logout successful", resp["message"])

	// Verify that the token is now in the tokenBlacklist.
	blacklisted, exists := tokenBlacklist[tokenString]
	assert.True(t, exists, "Token should be in the blacklist")
	assert.True(t, blacklisted, "Blacklisted value should be true")
}

// ---------------------
// RSVP Unit Tests
// ---------------------

// TestRSVP_Success tests that a valid RSVP request creates an RSVP and returns the updated count.
func TestRSVP_Success(t *testing.T) {
	// Create a test event.
	event := Event{
		Title:       "RSVP Test Event",
		Description: "Event for RSVP test",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "Test Venue",
	}
	testDB.Create(&event)

	// Create a test user.
	password := "testpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := User{
		Name:     "RSVP Tester",
		Email:    "rsvp_tester@example.com",
		Password: string(hashedPassword),
	}
	// Ensure any existing user with this email is removed.
	testDB.Exec("DELETE FROM users WHERE email = ?", user.Email)
	testDB.Create(&user)

	// Generate a JWT token for this user.
	tokenString, err := generateToken(user.ID)
	assert.NoError(t, err)

	// Prepare the RSVP request body with the user's email.
	reqData := map[string]string{
		"email": user.Email,
	}
	reqJSON, _ := json.Marshal(reqData)

	// Create a POST request to RSVP.
	req, _ := http.NewRequest("POST", fmt.Sprintf("/events/%d/rsvp", event.ID), bytes.NewBuffer(reqJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))

	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	router.HandleFunc("/events/{id}/rsvp", rsvpHandler).Methods("POST")
	router.ServeHTTP(rr, req)

	// Expect HTTP 200 OK.
	assert.Equal(t, http.StatusOK, rr.Code)

	// Decode response.
	var resp map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "RSVP successful", resp["message"])
	// The rsvp_count should be 1.
	count, ok := resp["rsvp_count"].(float64)
	assert.True(t, ok, "rsvp_count should be a number")
	assert.Equal(t, float64(1), count)

	// Cleanup test data.
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM rsvp_models WHERE event_id = ?", event.ID)
		testDB.Exec("DELETE FROM events WHERE id = ?", event.ID)
		testDB.Exec("DELETE FROM users WHERE id = ?", user.ID)
	})
}

// TestRSVP_AlreadyRSVPed tests that a duplicate RSVP request returns "Already RSVPed" and the correct count.
func TestRSVP_AlreadyRSVPed(t *testing.T) {
	// Create a test event.
	event := Event{
		Title:       "RSVP Duplicate Test Event",
		Description: "Event for RSVP duplicate test",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "Test Venue",
	}
	testDB.Create(&event)

	// Create a test user.
	password := "testpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := User{
		Name:     "RSVP Duplicate Tester",
		Email:    "duplicate_tester@example.com",
		Password: string(hashedPassword),
	}
	testDB.Exec("DELETE FROM users WHERE email = ?", user.Email)
	testDB.Create(&user)

	// Generate a JWT token for the user.
	tokenString, err := generateToken(user.ID)
	assert.NoError(t, err)

	// Prepare the RSVP request body.
	reqData := map[string]string{
		"email": user.Email,
	}
	reqJSON, _ := json.Marshal(reqData)

	router := mux.NewRouter()
	router.HandleFunc("/events/{id}/rsvp", rsvpHandler).Methods("POST")

	// First RSVP request.
	req1, _ := http.NewRequest("POST", fmt.Sprintf("/events/%d/rsvp", event.ID), bytes.NewBuffer(reqJSON))
	req1.Header.Set("Content-Type", "application/json")
	req1.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))
	rr1 := httptest.NewRecorder()
	router.ServeHTTP(rr1, req1)
	assert.Equal(t, http.StatusOK, rr1.Code)

	// Second RSVP request (duplicate).
	req2, _ := http.NewRequest("POST", fmt.Sprintf("/events/%d/rsvp", event.ID), bytes.NewBuffer(reqJSON))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))
	rr2 := httptest.NewRecorder()
	router.ServeHTTP(rr2, req2)
	assert.Equal(t, http.StatusOK, rr2.Code)

	var resp2 map[string]interface{}
	err = json.Unmarshal(rr2.Body.Bytes(), &resp2)
	assert.NoError(t, err)
	assert.Equal(t, "Already RSVPed", resp2["message"])
	count, ok := resp2["rsvp_count"].(float64)
	assert.True(t, ok, "rsvp_count should be a number")
	assert.Equal(t, float64(1), count)

	t.Cleanup(func() {
		testDB.Exec("DELETE FROM rsvp_models WHERE event_id = ?", event.ID)
		testDB.Exec("DELETE FROM events WHERE id = ?", event.ID)
		testDB.Exec("DELETE FROM users WHERE id = ?", user.ID)
	})
}

// TestRSVP_EmailMismatch tests that if the email in the request body does not match the logged-in user's email, a 401 error is returned.
func TestRSVP_EmailMismatch(t *testing.T) {
	// Create a test event.
	event := Event{
		Title:       "RSVP Email Mismatch Event",
		Description: "Event for RSVP email mismatch test",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "Test Venue",
	}
	testDB.Create(&event)

	// Create a test user.
	password := "testpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := User{
		Name:     "RSVP Mismatch Tester",
		Email:    "mismatch_tester@example.com",
		Password: string(hashedPassword),
	}
	testDB.Exec("DELETE FROM users WHERE email = ?", user.Email)
	testDB.Create(&user)

	// Generate a JWT token for the user.
	tokenString, err := generateToken(user.ID)
	assert.NoError(t, err)

	// Prepare a request body with an email that does not match.
	reqData := map[string]string{
		"email": "different@example.com",
	}
	reqJSON, _ := json.Marshal(reqData)

	req, _ := http.NewRequest("POST", fmt.Sprintf("/events/%d/rsvp", event.ID), bytes.NewBuffer(reqJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/events/{id}/rsvp", rsvpHandler).Methods("POST")
	router.ServeHTTP(rr, req)

	// Expect a 401 Unauthorized response.
	assert.Equal(t, http.StatusUnauthorized, rr.Code)

	t.Cleanup(func() {
		testDB.Exec("DELETE FROM rsvp_models WHERE event_id = ?", event.ID)
		testDB.Exec("DELETE FROM events WHERE id = ?", event.ID)
		testDB.Exec("DELETE FROM users WHERE id = ?", user.ID)
	})
}

func TestCancelRSVP(t *testing.T) {
	// Create a test event.
	event := Event{
		Title:       "Cancel RSVP Test Event",
		Description: "Event for cancel RSVP test",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "Test Venue",
	}
	testDB.Create(&event)

	// Create a test user.
	password := "testpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := User{
		Name:     "Cancel RSVP Tester",
		Email:    "cancel_tester@example.com",
		Password: string(hashedPassword),
	}
	testDB.Exec("DELETE FROM users WHERE email = ?", user.Email)
	testDB.Create(&user)

	// Generate a JWT token for this user.
	tokenString, err := generateToken(user.ID)
	assert.NoError(t, err)

	// Create an RSVP for the user.
	rsvp := RSVP_model{
		EventID: event.ID,
		UserID:  user.ID,
	}
	testDB.Create(&rsvp)

	// Create a DELETE request to cancel RSVP.
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/events/%d/rsvp", event.ID), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))

	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	router.HandleFunc("/events/{id}/rsvp", func(w http.ResponseWriter, r *http.Request) {
		CancelRSVP(w, r, testDB)
	}).Methods("DELETE")
	router.ServeHTTP(rr, req)

	// Expect HTTP 200 OK.
	assert.Equal(t, http.StatusOK, rr.Code)

	// Decode response.
	var resp map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "RSVP canceled successfully", resp["message"])

	// Check if RSVP was removed from the database.
	var remainingRSVP RSVP_model
	result := testDB.Where("event_id = ? AND user_id = ?", event.ID, user.ID).First(&remainingRSVP)
	assert.Error(t, result.Error, "RSVP should be deleted from database")

	// Cleanup test data.
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM rsvp_models WHERE event_id = ?", event.ID)
		testDB.Exec("DELETE FROM events WHERE id = ?", event.ID)
		testDB.Exec("DELETE FROM users WHERE id = ?", user.ID)
	})
}

// ---------------------
// Comments Unit Tests
// ---------------------

func TestCreateComment(t *testing.T) {
	// Seed an event and a user
	ev := Event{
		Title:       "E",
		Description: "D",
		Date:        time.Now().Add(24 * time.Hour),
		Location:    "L",
	}
	testDB.Create(&ev)

	usr := User{
		Name:     "TestUser",
		Email:    "test@example.com",
		Password: "hashed",
	}
	testDB.Create(&usr)

	// 1) Generate a JWT token for this user
	tokenString, err := generateToken(usr.ID)
	assert.NoError(t, err)

	// 2) Build request with only "content" in the body
	body := map[string]string{
		"comment": "Great event!",
	}
	payload, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", fmt.Sprintf("/events/%d/comments", ev.ID), bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	// 3) Set the Authorization header
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))

	// Perform the request
	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	router.HandleFunc("/events/{id}/comments", createCommentHandler).Methods("POST")
	router.ServeHTTP(rr, req)

	// Assertions
	assert.Equal(t, http.StatusOK, rr.Code)

	var c Comment
	err = json.Unmarshal(rr.Body.Bytes(), &c)
	assert.NoError(t, err)

	assert.Equal(t, usr.ID, c.UserID, "should record the commenter’s user ID")
	assert.Equal(t, ev.ID, c.EventID, "should record the event ID")
	assert.Equal(t, "Great event!", c.Comment, "content should match")
	assert.Equal(t, usr.Name, c.User.Name, "should return the commenter’s username")
}
