// src/__tests__/CalendarView.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import FullCalendarView from "../pages/FullCalendarView";
import axios from "axios";
import { vi } from "vitest";
vi.mock("axios");

describe("CalendarView", () => {
  it("renders calendar and shows events", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ID: 1,
          Title: "Mock Event",
          Date: "2025-03-30T10:00:00",
          Location: "Gainesville",
          Description: "A sample event",
        }
      ]
    });

    render(<FullCalendarView />);

    await waitFor(() => {
      const event = screen.queryByText(/mock event/i);
      expect(event).toBeTruthy(); 
    });
  });
});
