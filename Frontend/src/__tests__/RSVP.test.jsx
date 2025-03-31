import { render, screen, fireEvent } from "@testing-library/react";
import EventList from "../pages/EventList";

const mockEvents = [
  {
    ID: 1,
    Title: "Mock Event",
    Date: "2025-03-20T14:00:00",
    Location: "UF Library",
    Description: "Test description",
  },
];

describe("EventList RSVP", () => {
  it("shows RSVP button (if implemented)", () => {
    render(<EventList events={mockEvents} />);

    // Only test this if your component has RSVP logic
    const rsvpBtn = screen.queryByText(/rsvp/i);
    if (rsvpBtn) {
      fireEvent.click(rsvpBtn);
      expect(screen.queryByText(/cancel rsvp/i)).toBeInTheDocument();
    } else {
      console.warn("RSVP button not implemented yet");
    }
  });
});
