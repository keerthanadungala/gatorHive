import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EventList.css"; // Import styles

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({}); // { eventId: true/false }

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const token = localStorage.getItem("jwt_token"); // Get token from localStorage
  
    axios.get("http://localhost:8080/events", {
      headers: { Authorization: `Bearer ${token}` } // Include token in the headers
    })
      .then(response => {
        // Set the events and RSVP status (UserHasRSVP)
        const eventsWithRSVPStatus = response.data.map(event => ({
          ...event,
          userHasRSVP: event.user_has_rsvp, // Make sure the backend response has this field
          rsvpCount: event.rsvp_count // Use the rsvp_count provided by the backend
        }));
        setEvents(eventsWithRSVPStatus);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("🗑 Are you sure you want to delete this event?")) {
      return;
    }

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
  
    // Optimistically update the button text and RSVP status
    setRsvps((prev) => ({ ...prev, [eventId]: !isRSVPd }));
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.ID === eventId
          ? { ...event, userHasRSVP: !isRSVPd, rsvpCount: isRSVPd ? event.rsvpCount - 1 : event.rsvpCount + 1 } // Update count optimistically
          : event
      )
    );
  
    try {
      let response;
      if (isRSVPd) {
        // Cancel RSVP API call
        response = await axios.post(
          `http://localhost:8080/events/${eventId}/cancel-rsvp`,
          { email: userEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // RSVP API call
        response = await axios.post(
          `http://localhost:8080/events/${eventId}/rsvp`,
          { email: userEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      // Ensure that the RSVP count is updated with the backend response
      const updatedRSVPCount = response.data.rsvp_count;
  
      // Update RSVP count with the backend response
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.ID === eventId
            ? { ...event, rsvpCount: updatedRSVPCount } // Use the count from the API response
            : event
        )
      );
  
      console.log(response.data.message); // Log success message
  
    } catch (error) {
      console.error("RSVP error:", error);
  
      // If an error occurs, revert the optimistic UI changes
      setRsvps((prev) => ({ ...prev, [eventId]: isRSVPd }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.ID === eventId
            ? { ...event, userHasRSVP: isRSVPd } // Revert RSVP status if there's an error
            : event
        )
      );
    }
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
              <p className="event-date">📅 {event.Date.split("T")[0]} | ⏰ {event.Date.split("T")[1]?.slice(0, 5)}</p>
              <p className="event-location">📍 {event.Location}</p>
              <p className="event-description">{event.Description}</p>
              <p className="event-rsvp-count">👥 RSVPs: {event.rsvpCount || 0}</p>
              <div className="button-container">
                <Link to={`/events/update/${event.ID}`} className="edit-btn">✏️ Edit</Link>
                <button onClick={() => handleDelete(event.ID)} className="delete-btn">🗑️ Delete</button>
                <button onClick={() => handleRSVP(event.ID, event.userHasRSVP)} className="edit-btn">
                  {event.userHasRSVP ? "✅ Cancel RSVP" : "📌 RSVP"}
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
