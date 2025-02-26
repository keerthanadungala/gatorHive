import { useState, useEffect } from "react";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);

  // Fetch events from the backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get("http://localhost:8080/events")
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  };

  // Delete event function
  const handleDelete = (eventId) => {
    if (!window.confirm("🗑 Are you sure you want to delete this event?")) {
      return;
    }

    axios.delete(`http://localhost:8080/events/${eventId}`)
      .then(() => {
        setEvents(events.filter(event => event.ID !== eventId)); // Remove from state
      })
      .catch(error => {
        console.error("Error deleting event:", error);
      });
  };

  return (
    <div className="event-list-container">
      <h2 className="event-list-title">📋 Upcoming Gator Events</h2>
      {events.length === 0 ? (
        <p className="no-events">No events available. Create one!</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div key={event.ID} className="event-card">
              <h3 className="event-title">{event.Title}</h3>
              <p className="event-date">📅 {new Date(event.Date).toDateString()}</p>
              <p className="event-location">📍 {event.Location}</p>
              <p className="event-description">{event.Description}</p>
              <button className="delete-btn" onClick={() => handleDelete(event.ID)}>
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;


