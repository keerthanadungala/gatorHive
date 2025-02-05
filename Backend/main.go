package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Event model
type Event struct {
	gorm.Model
	Title       string
	Description string
	Date        time.Time
	Location    string
}

// Initialize the database
func initializeDB() (*gorm.DB, error) {
	db, err := gorm.Open("sqlite3", "./gatorhive.db")
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&Event{})
	return db, nil
}

// Get all events
func GetEvents(w http.ResponseWriter, r *http.Request) {
	db, err := initializeDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var events []Event
	db.Find(&events)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// Create a new event
func CreateEvent(w http.ResponseWriter, r *http.Request) {
	db, err := initializeDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var event Event
	err = json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	event.Date = time.Now() // default to the current time for simplicity
	db.Create(&event)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func main() {
	// Create router and routes
	r := mux.NewRouter()
	r.HandleFunc("/events", GetEvents).Methods("GET")
	r.HandleFunc("/events", CreateEvent).Methods("POST")

	// Start server
	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
