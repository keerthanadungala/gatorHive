import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import EventCreate from "./pages/EventCreate";



import EventList from "./pages/EventList";



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<EventCreate />} />






        <Route path="/events" element={<EventList />} />



      </Routes>
    </Router>
  );
}

export default App;
