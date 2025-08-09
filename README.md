# 🐊 GatorHive: Centralized Event Management for UF Students

## Problem Statement

Students at the University of Florida often struggle with efficiently managing and organizing campus events. The presence of numerous academic, social, and extracurricular activities leads to:

- Communication gaps  
- Low event visibility  
- Missed opportunities for collaboration

### Goal

**GatorHive** aims to solve these problems by offering a **centralized, user-friendly platform** tailored to UF students. The platform enables students to:

- Browse upcoming events  
- RSVP to events  
- Create and promote events  
- Engage in discussions through comments  
- Join waitlists for full-capacity events

This fosters a stronger, more connected campus community while reflecting the unique culture and needs of UF.

---

## Team Members

| Name                          | UFID      | Role      |
|-------------------------------|-----------|-----------|
| **Harshavardhan Chary Vadla** | 15764530  | Frontend/Backend  |
| **Akash Challa**              | 51281562  | Frontend  |
| **Gautham Varma Kucharlapati**| 52957224  | Backend   |
| **Keerthana Dungala**         | 57210215  | Backend   |

---

## Features

- **Search** for events by title, location, or description
- **RSVP** to events or cancel RSVP
- **Join Waitlist** for full events
- **Comment/Discuss** on events
- **Calendar View** of all events
- **JWT-based Authentication**
- **Unit + Cypress Tests** for reliability

---

## Technologies Used

- **Frontend**: React.js, React Router, Axios, CSS
- **Backend**: Go (Gorilla Mux, GORM, SQLite)
- **Testing**: Vitest, React Testing Library, Cypress
- **Authentication**: JWT
- **Storage**: Lightweight, file-based SQLite for quick local development and persistence

---

## Installation & Running Instructions

### Prerequisites

- Node.js (>= 18)
- npm
- Go (for backend)
- SQLite (for local DB)

---

### Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs the frontend on [http://localhost:5173](http://localhost:5173)

---

### Run Backend

```bash
cd Backend
go run main.go
```

Runs backend server on [http://localhost:8080]


---

## Running Frontend Tests

### Unit Tests (Frontend)

```bash
npx vitest
```

### End-to-End Tests (Cypress)

```bash
npx cypress open
```

## Running backend unit tests

`go test -v`

