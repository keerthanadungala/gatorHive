package main

import (
	"bytes"
	"encoding/json"
	"fmt"
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

// Testing the PUT /events/{id} endpoint to ensure an event can be updated.
func TestUpdateEvent(t *testing.T) {
	initialEvent := Event{
		Title:       "Initial Event",
		Description: "Initial Description",
		Location:    "Old Location",
	}
	eventJSON, err := json.Marshal(initialEvent)
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
	json.Unmarshal(rr.Body.Bytes(), &createdEvent)

	updatedEvent := Event{
		Title:       "Updated Event",
		Description: "Updated Description",
		Location:    "New Location",
	}
	updatedEventJSON, _ := json.Marshal(updatedEvent)

	updateReq, _ := http.NewRequest("PUT", fmt.Sprintf("/events/%d", createdEvent.ID), bytes.NewBuffer(updatedEventJSON))
	updateReq.Header.Set("Content-Type", "application/json")
	updateRR := httptest.NewRecorder()
	r.HandleFunc("/events/{id}", UpdateEvent).Methods("PUT")

	r.ServeHTTP(updateRR, updateReq)

	assert.Equal(t, http.StatusOK, updateRR.Code)

	var updatedResponse Event
	json.Unmarshal(updateRR.Body.Bytes(), &updatedResponse)

	assert.Equal(t, "Updated Event", updatedResponse.Title)
}

// Testing the DELETE /events/{id} endpoint to ensure an event can be deleted.
func TestDeleteEvent(t *testing.T) {
	newEvent := Event{
		Title:       "Event to Delete",
		Description: "This event will be deleted",
		Location:    "Nowhere",
	}
	eventJSON, _ := json.Marshal(newEvent)

	req, _ := http.NewRequest("POST", "/events", bytes.NewBuffer(eventJSON))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r := mux.NewRouter()
	r.HandleFunc("/events", CreateEvent).Methods("POST")

	r.ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	var createdEvent Event
	json.Unmarshal(rr.Body.Bytes(), &createdEvent)

	deleteReq, _ := http.NewRequest("DELETE", fmt.Sprintf("/events/%d", createdEvent.ID), nil)
	deleteRR := httptest.NewRecorder()
	r.HandleFunc("/events/{id}", DeleteEvent).Methods("DELETE")

	r.ServeHTTP(deleteRR, deleteReq)

	assert.Equal(t, http.StatusOK, deleteRR.Code)
	assert.Contains(t, deleteRR.Body.String(), "Event deleted successfully")
}
