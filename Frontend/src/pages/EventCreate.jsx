import { useState } from "react";
import "./EventCreate.css";
import axios from "axios";

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

    // Convert date and time to a single ISO format string
    const formattedDate = new Date(`${eventData.date}T${eventData.time}:00`).toISOString();

    // Create a new event object with formatted date
    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      date: formattedDate, // Ensure proper timestamp format
      location: eventData.location,
    };

    axios.post("http://localhost:8080/events", newEvent)
    .then(response => {
      console.log("Event created:", response.data);
      setMessage("🎉 Event created successfully!");
      setEventData({ title: "", date: "", time: "", location: "", description: "" });
    })
    .catch(error => {
      console.error("Error creating event:", error);
      setMessage("❌ Failed to create event!");
    });
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
