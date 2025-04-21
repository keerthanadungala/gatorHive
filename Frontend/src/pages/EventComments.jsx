import { useEffect, useState } from "react";
import axios from "axios";
import "./EventComments.css"; // Make sure this CSS file exists

const EventComments = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const email = localStorage.getItem("user_email");
  const token = localStorage.getItem("jwt_token");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/events/${eventId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8080/events/${eventId}/comments`,
        { comment: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setComments((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`http://localhost:8080/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.ID !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return (
    <div className="comment-box">
      <h3>💬 Comments</h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your comment..."
          rows={3}
        />
        <button type="submit">Post</button>
      </form>

      <ul>
        {comments.map((c) => (
          <li key={c.ID}>
            <span className="author">{c.user?.name}</span>
            <div className="comment-content">{c.comment}</div>
            <div className="comment-meta">
              {new Date(c.CreatedAt).toLocaleString()}
              {(c.user?.email === email) && (
                <button onClick={() => handleDelete(c.ID)} className="delete-btnn">
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventComments;
