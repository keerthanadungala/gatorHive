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
	Title       string
	Description string
	Date        time.Time
	Location    string
}

// User model
type User struct {
	gorm.Model
	Username string `gorm:"unique"`
	Password string
}

// TODO: JWT secret key (change for production)
var jwtSecret = []byte("your_secret_key")

// Initialize the database
func initializeDB() (*gorm.DB, error) {
	db, err := gorm.Open("sqlite3", "./gatorhive.db")
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&Event{}, &User{})
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

// Authentication Handlers

// SignUp handles new user registration.
func SignUp(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	db, err := initializeDB()
	if err != nil {
		http.Error(w, "Failed to connect to database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	// Create the user.
	if err := db.Create(&user).Error; err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

// Login handles user login and returns a JWT token.
func Login(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var reqUser User
	if err := json.NewDecoder(r.Body).Decode(&reqUser); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user User
	if err := db.Where("username = ?", reqUser.Username).First(&user).Error; err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqUser.Password)); err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
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

	// Authentication routes.
	r.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) { SignUp(w, r, db) }).Methods("POST")
	r.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) { Login(w, r, db) }).Methods("POST")

	// Enable CORS for React frontend
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	origins := handlers.AllowedOrigins([]string{"http://localhost:5173"})

	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(origins, methods, headers)(r)))
	log.Fatal(http.ListenAndServe(":8080", r))
}
