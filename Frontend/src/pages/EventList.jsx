import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EventList.css"; // Import styles

const EventList = () => {
  const [events, setEvents] = useState([]);

  // Fetch events from backend
  useEffect(() => {
    axios.get("http://localhost:8080/events")
      .then(response => setEvents(response.data))
      .catch(error => console.error("Error fetching events:", error));
  }, []);

  return (
    <div className="event-list-container">
      <h2 className="event-list-title">📋 Upcoming Gator Events</h2>
      {events.length === 0 ? (
        <p className="no-events">No events available. Create one!</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div key={event.ID} className="event-card"> {/* FIX: Add unique key */}
              <h3 className="event-title">{event.Title}</h3> {/* FIX: Ensure correct field names */}
              <p className="event-date">📅 {event.Date.split("T")[0]} | ⏰ {event.Date.split("T")[1]?.slice(0,5)}</p>
              <p className="event-location">📍 {event.Location}</p>
              <p className="event-description">{event.Description}</p>
              {/* Add Edit Button */}
              <Link to={`/events/update/${event.ID}`} className="edit-btn">✏️ Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
