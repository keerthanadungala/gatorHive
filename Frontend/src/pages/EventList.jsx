import { useState, useEffect } from "react";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/events")
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  }, []);

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
