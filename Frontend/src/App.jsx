import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import EventCreate from "./pages/EventCreate";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<EventCreate />} />
      </Routes>
    </Router>
  );
}

export default App;
