import { useState } from "react";
import "./EventCreate.css"; // Import the updated CSS file

const EventCreate = () => {
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
    setMessage("🎉 Event created successfully!");
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
