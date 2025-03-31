import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import EventCreate from "./pages/EventCreate";
import EventList from "./pages/EventList";
import EventUpdate from "./pages/EventUpdate";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import FullCalendarView from "./pages/FullCalendarView";
import ProtectedRoute from "./components/ProtectedRoute";

import { useState } from "react";

function App() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Gator Football Meetup",
      date: "2025-02-10",
      time: "6:00 PM",
      location: "UF Stadium",
      description: "Join us for an exciting game!",
    },
    {
      id: 2,
      title: "Hackathon 2025",
      date: "2025-03-15",
      time: "9:00 AM",
      location: "UF Tech Lab",
      description: "A 24-hour coding challenge with prizes!",
    },
  ]);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <EventCreate setEvents={setEvents} events={events} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventList events={events} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/update/:id"
          element={
            <ProtectedRoute>
              <EventUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <FullCalendarView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;



