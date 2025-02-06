import { useState } from "react";
import "./EventList.css"; // Import styles for the event list

const EventList = () => {
  // Sample event data (Later, we'll replace this with API data)
  const [events, setEvents] = useState([
    { id: 1, title: "Gator Football Meetup", date: "2025-02-10", time: "6:00 PM", location: "UF Stadium", description: "Join us for an exciting game!" },
    { id: 2, title: "Hackathon 2025", date: "2025-03-15", time: "9:00 AM", location: "UF Tech Lab", description: "A 24-hour coding challenge with prizes!" },
    { id: 3, title: "Spring Fest", date: "2025-04-20", time: "2:00 PM", location: "UF Plaza", description: "Music, food, and games to celebrate spring!" }
  ]);

  return (
    <div className="event-list-container">
      <h2 className="event-list-title">📋 Upcoming Gator Events</h2>
      {events.length === 0 ? (
        <p className="no-events">No events available. Create one!</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-date">📅 {event.date} | ⏰ {event.time}</p>
              <p className="event-location">📍 {event.location}</p>
              <p className="event-description">{event.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
