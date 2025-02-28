package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/handlers"
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
func GetEvents(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var events []Event
	db.Find(&events)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// Create a new event
func CreateEvent(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var event Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	event.Date = time.Now() // default to the current time
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

	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

	// Enable CORS for React frontend
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	origins := handlers.AllowedOrigins([]string{"http://localhost:5173"})

	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(origins, methods, headers)(r)))
	log.Fatal(http.ListenAndServe(":8080", r))
}
