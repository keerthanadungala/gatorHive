import { useState } from "react";
import "./EventList.css"; // Import styles

const EventList = ({ events }) => {
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
