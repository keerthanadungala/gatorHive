import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EventCreate.css"; // Reuse styles

const EventUpdate = () => {
  const { id } = useParams(); // Get event ID from URL
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  const [message, setMessage] = useState("");


  useEffect(() => {
    axios
      .get(`http://localhost:8080/events/${id}`)
      .then((response) => {
        const event = response.data;

        const eventDate = event.Date.split("T")[0]; // Extracts "YYYY-MM-DD"
        const eventTime = event.Date.split("T")[1]?.slice(0, 5); // Extracts "HH:MM"
        setEventData({
          title: event.Title,
          date: eventDate, // Set date
          time: eventTime, // Set time
          location: event.Location,
          description: event.Description,
        });
      })
      .catch((error) => console.error("Error fetching event:", error));
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Handle update submission
  const handleSubmit = (e) => {
    e.preventDefault();


    let formattedDate = new Date(`${eventData.date}T${eventData.time}:00`).toISOString();


    formattedDate = formattedDate.replace(".000.000Z", ".000Z");

    const updatedEvent = {
      Title: eventData.title,
      Date: formattedDate, // Ensure proper ISO timestamp
      Location: eventData.location,
      Description: eventData.description,
    };

    axios
      .put(`http://localhost:8080/events/${id}`, updatedEvent, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setMessage("✅ Event updated successfully!");
        setTimeout(() => navigate("/events"), 2000);
      })
      .catch((error) => console.error("Error updating event:", error));
  };

  return (
    <div className="event-create-container">
      <h2>Update Event ✏️</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title"> Title:</label>
          <input type="text" id="title" name="title" value={eventData.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date"> Date:</label>
            <input type="date" id="date" name="date" value={eventData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="time"> Time:</label>
            <input type="time" id="time" name="time" value={eventData.time} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location"> Location:</label>
          <input type="text" id="location" name="location" value={eventData.location} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description"> Description:</label>
          <textarea id="description" name="description" value={eventData.description} onChange={handleChange} required></textarea>
        </div>

        <button type="submit" className="submit-btn">
          Update Event
        </button>
      </form>
    </div>
  );
};

export default EventUpdate;



