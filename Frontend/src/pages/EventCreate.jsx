
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
    capacity: "", 
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if all fields are filled
    if (
      !eventData.title ||
      !eventData.date ||
      !eventData.time ||
      !eventData.location ||
      !eventData.description ||
      !eventData.capacity
    ) {
      setMessage("⚠️ Please fill in all fields before submitting.");
      return;
    }

    try {
      const formattedDate = new Date(`${eventData.date}T${eventData.time}:00`).toISOString();

      const newEvent = {
        title: eventData.title,
        description: eventData.description,
        date: formattedDate,
        location: eventData.location,
        capacity: parseInt(eventData.capacity), 
      };

      const response = await axios.post("http://localhost:8080/events", newEvent);

      console.log("Event created:", response.data);
      setMessage("🎉 Event created successfully!");

      setEventData({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        capacity: "",
      });

      if (setEvents) {
        setEvents([...events, response.data]);
      }

    } catch (error) {
      console.error("Error creating event:", error);
      setMessage("❌ Failed to create event. Please try again.");
    }
  };

  return (
    <div className="event-create-container">
      <h2>Create a New Gator Event 🐊</h2>

      {message && <p className="message" aria-live="polite">{message}</p>}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input id="title" type="text" name="title" value={eventData.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input id="date" type="date" name="date" value={eventData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input id="time" type="time" name="time" value={eventData.time} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input id="location" type="text" name="location" value={eventData.location} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" value={eventData.description} onChange={handleChange} required></textarea>
        </div>

        {/* Add Capacity Field */}
        <div className="form-group">
          <label htmlFor="capacity">Capacity:</label>
          <input id="capacity" type="number" name="capacity" value={eventData.capacity} onChange={handleChange} required />
        </div>

        <button type="submit" className="submit-btn">Create Event</button>
      </form>
    </div>
  );
};

export default EventCreate;


