package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

// Testing the GET /events endpoint to ensure it returns the list of events with status 200 OK.
func TestGetEvents(t *testing.T) {
	// Create a mock HTTP request for GET /events
	req, err := http.NewRequest("GET", "/events", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	// Create a new router and register the routes
	r := mux.NewRouter()
	r.HandleFunc("/events", GetEvents).Methods("GET")

	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	assert.Contains(t, rr.Body.String(), "[")
}

// Testing the POST /events endpoint to ensure a new event can be created.
func TestCreateEvent(t *testing.T) {
	event := Event{
		Title:       "Test Event",
		Description: "A test event",
		Location:    "Campus Hall",
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		t.Fatal(err)
	}

	req, err := http.NewRequest("POST", "/events", bytes.NewBuffer(eventJSON))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()

	r := mux.NewRouter()
	r.HandleFunc("/events", CreateEvent).Methods("POST")

	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var createdEvent Event
	if err := json.NewDecoder(rr.Body).Decode(&createdEvent); err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, "Test Event", createdEvent.Title)
}
