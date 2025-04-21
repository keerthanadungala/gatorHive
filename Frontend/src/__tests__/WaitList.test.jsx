import { render, screen, fireEvent } from "@testing-library/react";
import EventList from "../pages/EventList";
import axios from "axios";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("axios");

describe("Waitlist Feature", () => {
  it("shows waitlist button and handles waitlist request", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ID: 1,
          title: "Full Event",
          date: "2025-05-01T10:00:00",
          location: "UF Campus",
          description: "Event is full",
          rsvp_count: 50,
          capacity: 50,
          user_has_rsvp: false,
          user_on_waitlist: false
        }
      ]
    });

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    );

    const joinBtn = await screen.findByRole("button", { name: /join waitlist/i });
    expect(joinBtn).toBeInTheDocument();

    vi.spyOn(axios, "post").mockResolvedValueOnce({ data: { message: "Added to waitlist" } });
    fireEvent.click(joinBtn);
  });
});
