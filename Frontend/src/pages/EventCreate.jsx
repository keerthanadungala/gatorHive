import { useState } from "react";
import "./EventCreate.css";

const EventCreate = ({ setEvents, events }) => {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Check if all fields are filled
    if (!eventData.title || !eventData.date || !eventData.time || !eventData.location || !eventData.description) {
      alert("⚠️ Please fill in all fields before submitting.");
      return;
    }

    // Create new event object
    const newEvent = { id: events.length + 1, ...eventData };

    // Update state with the new event
    setEvents([...events, newEvent]);

    // Show success message
    setMessage("🎉 Event created successfully!");
    alert("🎉 Event created successfully!");

    // Reset form fields
    setEventData({ title: "", date: "", time: "", location: "", description: "" });
  };

  return (
    <div className="event-create-container">
      <h2>Create a New Gator Event 🐊</h2>
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

        <button type="submit" className="submit-btn"> Create Event</button>
      </form>
    </div>
  );
};

export default EventCreate;
