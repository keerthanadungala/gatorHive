import { render, screen } from "@testing-library/react";
import FullCalendarView from "../pages/FullCalendarView";
import axios from "axios";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("axios");

describe("CalendarView", () => {
  it("renders calendar and shows events", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ID: 1,
          title: "Mock Event",
          date: "2025-03-30T10:00:00",
          location: "Gainesville",
          description: "A sample event",
        }
      ]
    });

    render(
      <MemoryRouter>
        <FullCalendarView />
      </MemoryRouter>
    );

    const event = await screen.findByText(/mock event/i); 
    expect(event).toBeInTheDocument();
  });
});
