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
	testDB.AutoMigrate(&Event{}, &User{})

	code := m.Run()

	testDB.Close()
	os.Exit(code)
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
