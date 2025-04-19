import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Add search state

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const token = localStorage.getItem("jwt_token");
    axios.get("http://localhost:8080/events", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const eventsWithRSVPStatus = response.data.map(event => ({
        ...event,
        userHasRSVP: event.user_has_rsvp,
        rsvpCount: event.rsvp_count
      }));
      setEvents(eventsWithRSVPStatus);
    })
    .catch(error => {
      console.error("Error fetching events:", error);
    });
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("🗑 Are you sure you want to delete this event?")) return;
    axios.delete(`http://localhost:8080/events/${eventId}`)
      .then(() => {
        setEvents(events.filter(event => event.ID !== eventId));
      })
      .catch(error => {
        console.error("Error deleting event:", error);
      });
  };

  const handleRSVP = async (eventId, isRSVPd) => {
    const token = localStorage.getItem("jwt_token");
    const userEmail = localStorage.getItem("user_email");
    if (!token) {
      alert("Please log in to RSVP.");
      return;
    }

    setRsvps(prev => ({ ...prev, [eventId]: !isRSVPd }));
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.ID === eventId
          ? {
              ...event,
              userHasRSVP: !isRSVPd,
              rsvpCount: isRSVPd ? event.rsvpCount - 1 : event.rsvpCount + 1
            }
          : event
      )
    );

    try {
      const response = await axios.post(
        `http://localhost:8080/events/${eventId}/${isRSVPd ? "cancel-rsvp" : "rsvp"}`,
        { email: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRSVPCount = response.data.rsvp_count;
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.ID === eventId
            ? { ...event, rsvpCount: updatedRSVPCount }
            : event
        )
      );
    } catch (error) {
      console.error("RSVP error:", error);
      setRsvps(prev => ({ ...prev, [eventId]: isRSVPd }));
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.ID === eventId
            ? { ...event, userHasRSVP: isRSVPd }
            : event
        )
      );
    }
  };

  // 🔍 Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.Location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.Description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="event-list-container">
      <h2 className="event-list-title">📋 Upcoming Gator Events</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search events..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredEvents.length === 0 ? (
        <p className="no-events">No matching events found.</p>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((event) => (
            <div key={event.ID} className="event-card">
              <h3 className="event-title">{event.Title}</h3>
              <p className="event-date">📅 {event.Date.split("T")[0]} | ⏰ {event.Date.split("T")[1]?.slice(0, 5)}</p>
              <p className="event-location">📍 {event.Location}</p>
              <p className="event-description">{event.Description}</p>
              <p className="event-rsvp-count">👥 RSVPs: {event.rsvpCount || 0}</p>
              <div className="button-container">
                <Link to={`/events/update/${event.ID}`} className="edit-btn">Edit</Link>
                <button onClick={() => handleDelete(event.ID)} className="delete-btn">Delete</button>
                <button onClick={() => handleRSVP(event.ID, event.userHasRSVP)} className="edit-btn">
                  {event.userHasRSVP ? "Cancel RSVP" : "RSVP"}
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


