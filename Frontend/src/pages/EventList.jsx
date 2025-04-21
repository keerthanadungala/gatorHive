import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EventList.css";
import EventComments from "./EventComments";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleComments, setVisibleComments] = useState({}); // 🆕

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const token = localStorage.getItem("jwt_token");
    axios.get("http://localhost:8080/events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const eventsWithRSVPStatus = response.data.map(event => ({
          ID: event.ID,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          rsvpCount: event.rsvp_count,
          capacity: event.capacity,
          userHasRSVP: event.user_has_rsvp || false,
          userOnWaitlist: event.user_on_waitlist || false
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
              rsvpCount: isRSVPd ? event.rsvpCount - 1 : event.rsvpCount + 1,
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

  const handleWaitlist = async (eventId) => {
    const token = localStorage.getItem("jwt_token");
    const email = localStorage.getItem("user_email");

    if (!token || !email) {
      alert("Please log in to join the waitlist.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/events/${eventId}/waitlist`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state to reflect that user is now on waitlist
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.ID === eventId ? { ...event, userOnWaitlist: true } : event
        )
      );
      alert("✅ You've been added to the waitlist!");
    } catch (err) {
      console.error("Waitlist error:", err);
      alert("❌ Failed to join waitlist.");
    }
  };

  // 🆕 Toggle comment visibility
  const toggleComments = (eventId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="event-list-container">
      <h2 className="event-list-title">📋 Upcoming Gator Events</h2>

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
              <h3 className="event-title">{event.title}</h3>
              <p className="event-date">📅 {event.date.split("T")[0]} | ⏰ {event.date.split("T")[1]?.slice(0, 5)}</p>
              <p className="event-location">📍 {event.location}</p>
              <p className="event-description">{event.description}</p>
              <p className="event-rsvp-count">
                👥 RSVPs: {event.rsvpCount ?? 0} / {event.capacity ?? "Not Set"}
              </p>

              <div className="button-container">
                <Link to={`/events/update/${event.ID}`} className="edit-btn">Edit</Link>
                <button onClick={() => handleDelete(event.ID)} className="delete-btn">Delete</button>

                {event.userHasRSVP ? (
                  <button onClick={() => handleRSVP(event.ID, true)} className="edit-btn">Cancel RSVP</button>
                ) : event.capacity !== undefined && event.rsvpCount >= event.capacity ? (
                  event.userOnWaitlist ? (
                    <button disabled className="edit-btn">On Waitlist</button>
                  ) : (
                    <button onClick={() => handleWaitlist(event.ID)} className="edit-btn">Join Waitlist</button>
                  )
                ) : (
                  <button onClick={() => handleRSVP(event.ID, false)} className="edit-btn">RSVP</button>
                )}

              </div>

              {/* Toggle Comments Button */}
              <button
                onClick={() => toggleComments(event.ID)}
                className="toggle-comments-btn"
              >
                💬 {visibleComments[event.ID] ? "Hide Comments" : "Show Comments"}
              </button>

              {/* Conditionally render comments */}
              {visibleComments[event.ID] && <EventComments eventId={event.ID} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
