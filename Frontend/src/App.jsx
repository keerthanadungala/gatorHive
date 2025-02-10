import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import EventCreate from "./pages/EventCreate";
import EventList from "./pages/EventList";
import { useState } from "react";

function App() {
  const [events, setEvents] = useState([
    { id: 1, title: "Gator Football Meetup", date: "2025-02-10", time: "6:00 PM", location: "UF Stadium", description: "Join us for an exciting game!" },
    { id: 2, title: "Hackathon 2025", date: "2025-03-15", time: "9:00 AM", location: "UF Tech Lab", description: "A 24-hour coding challenge with prizes!" },
  ]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<EventCreate setEvents={setEvents} events={events} />} />
        <Route path="/events" element={<EventList events={events} />} />
      </Routes>
    </Router>
  );
}

export default App;
