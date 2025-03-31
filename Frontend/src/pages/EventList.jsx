import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios
      .get("http://localhost:8080/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("🗑 Are you sure you want to delete this event?")) return;

    axios.delete(`http://localhost:8080/events/${eventId}`)
      .then(() => {
        setEvents(events.filter((event) => event.ID !== eventId));
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
      });
  };

  const handleRSVP = (eventId) => {
    const hasRSVPed = rsvps[eventId];

    // Update frontend immediately
    setRsvps((prev) => ({
      ...prev,
      [eventId]: !hasRSVPed,
    }));

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.ID === eventId
          ? {
              ...event,
              RSVPCount: event.RSVPCount + (hasRSVPed ? -1 : 1),
            }
          : event
      )
    );

    // Send RSVP to backend
    axios
      .post(
        `http://localhost:8080/events/${eventId}/rsvp`,
        {email: email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // (Optional) Sync RSVP count with response
        if (response.data?.rsvp_count !== undefined) {
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.ID === eventId
                ? { ...event, RSVPCount: response.data.rsvp_count }
                : event
            )
          );
        }
      })
      .catch((error) => {
        console.error("Error sending RSVP:", error);
        alert("❌ RSVP failed. Please try again.");
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
              <p className="event-date">
                📅 {event.Date.split("T")[0]} | ⏰ {event.Date.split("T")[1]?.slice(0, 5)}
              </p>
              <p className="event-location">📍 {event.Location}</p>
              <p className="event-description">{event.Description}</p>
              <p className="event-rsvp-count">👥 RSVPs: {event.RSVPCount || 0}</p>
              <div className="button-container">
                <Link to={`/events/update/${event.ID}`} className="edit-btn">
                  ✏️ Edit
                </Link>
                <button onClick={() => handleDelete(event.ID)} className="delete-btn">
                  🗑️ Delete
                </button>
                <button onClick={() => handleRSVP(event.ID)} className="edit-btn">
                  {rsvps[event.ID] ? "✅ Cancel RSVP" : "📌 RSVP"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
