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
    location: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  // Fetch existing event details
  useEffect(() => {
    axios.get(`http://localhost:8080/events/${id}`)
      .then(response => {
        const event = response.data;
  
        // Extract date and time from event.Date (ISO format)
        const eventDate = event.Date.split("T")[0]; // Extracts "YYYY-MM-DD"
        const eventTime = event.Date.split("T")[1]?.slice(0,5); // Extracts "HH:MM"
  
        setEventData({
          title: event.Title,
          date: eventDate, // Set date
          time: eventTime, // Set time
          location: event.Location,
          description: event.Description,
        });
      })
      .catch(error => console.error("Error fetching event:", error));
  }, [id]);  

  // Handle input changes
  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Handle update submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure correct JSON structure with Date and Time
    const updatedEvent = {
      Title: eventData.title,
      Date: `${eventData.date}T${eventData.time}:00Z`, // Combine Date and Time
      Location: eventData.location,
      Description: eventData.description,
    };

    axios.put(`http://localhost:8080/events/${id}`, updatedEvent, {
      headers: { "Content-Type": "application/json" }
    })
      .then(() => {
        setMessage("✅ Event updated successfully!");
        setTimeout(() => navigate("/events"), 2000);
      })
      .catch(error => console.error("Error updating event:", error));
};


  return (
    <div className="event-create-container">
      <h2>Update Event ✏️</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label> Title:</label>
          <input type="text" name="title" value={eventData.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
    <div className="form-group">
      <label> Date:</label>
      <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
    </div>
    <div className="form-group">
      <label> Time:</label> 
      <input type="time" name="time" value={eventData.time} onChange={handleChange} required /> 
    </div>
  </div>

        <div className="form-group">
          <label> Location:</label>
          <input type="text" name="location" value={eventData.location} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label> Description:</label>
          <textarea name="description" value={eventData.description} onChange={handleChange} required></textarea>
        </div>

        <button type="submit" className="submit-btn"> Update Event</button>
      </form>
    </div>
  );
};

export default EventUpdate;
