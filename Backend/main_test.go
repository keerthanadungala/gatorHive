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

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/stretchr/testify/assert"
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
	testDB.AutoMigrate(&Event{})

	code := m.Run()

	testDB.Close()
	os.Exit(code)
}

func getEventsHandler(w http.ResponseWriter, r *http.Request) {
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

// Testing GET /events
func TestGetEvents(t *testing.T) {
	// Seed mock data
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
