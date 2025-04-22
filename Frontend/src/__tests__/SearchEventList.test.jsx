import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventList from "../pages/EventList";
import axios from "axios";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
vi.mock("axios");

const mockEvents = [
    {
      ID: 1,
      title: "Gator Hackathon",
      date: "2025-05-01T10:00:00",
      location: "UF Campus",
      description: "Hackathon event",
      rsvp_count: 50,
      capacity: 50,
      user_has_rsvp: false,
      user_on_waitlist: false,
    },
    {
      ID: 2,
      title: "AI Workshop",
      date: "2025-06-01T12:00:00",
      location: "Zoom",
      description: "Learn about LLMs",
      rsvp_count: 20,
      capacity: 100,
      user_has_rsvp: false,
      user_on_waitlist: false,
    },
  ];
  
  


describe("EventList Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockEvents });
    localStorage.setItem("jwt_token", "mock-token");
    localStorage.setItem("user_email", "test@ufl.edu");
  });

  it("filters events using search input", async () => {
    render(
        <MemoryRouter>
          <EventList />
        </MemoryRouter>
      );
    screen.debug(); 


    await waitFor(() => {
        expect(screen.queryByText("Gator Hackathon")).toBeInTheDocument();
      });
      

    fireEvent.change(screen.getByPlaceholderText("🔍 Search events..."), {
      target: { value: "AI Workshop" },
    });

    expect(await screen.findByText("AI Workshop")).toBeInTheDocument();
    screen.debug();
    expect(screen.queryByText("Gator Hackathon")).not.toBeInTheDocument();
  });

  it("displays Join Waitlist if RSVP count >= capacity", async () => {
    render(
        <MemoryRouter>
          <EventList />
        </MemoryRouter>
      );
    const joinBtn = await screen.findByRole("button", { name: /join waitlist/i });
    expect(joinBtn).toBeInTheDocument();

  });
});
