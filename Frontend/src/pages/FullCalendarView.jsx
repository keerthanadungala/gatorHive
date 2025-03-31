import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useEffect, useState } from "react";
import "./FullCalendarView.css";

const FullCalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("jwt_token"); // Matching token key with Login.jsx
        const res = await axios.get("http://localhost:8080/events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const mapped = res.data.map((event) => ({
          id: event.ID,
          title: event.Title,
          date: event.Date,
          extendedProps: {
            location: event.Location,
            description: event.Description,
            time: event.Date.split("T")[1]?.slice(0, 5),
          }
        }));
        setEvents(mapped);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = ({ event }) => {
    setSelectedEvent(event);
  };

  const closeModal = () => setSelectedEvent(null);

  return (
    <div className="full-calendar-container">
      <h2>📆 GatorHive Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: ""
        }}
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>📍 Location:</strong> {selectedEvent.extendedProps.location}</p>
            <p><strong>🕒 Time:</strong> {selectedEvent.extendedProps.time}</p>
            <p><strong>📝 Description:</strong> {selectedEvent.extendedProps.description}</p>
            <button className="modal-close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullCalendarView;



