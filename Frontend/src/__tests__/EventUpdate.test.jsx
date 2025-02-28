import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest"; // ✅ Use "vi" for Vitest mocks
import EventUpdate from "../pages/EventUpdate";

// ✅ Mock axios using Vitest
vi.mock("axios");

describe("EventUpdate Component", () => {
  beforeEach(() => {
    // ✅ Mock GET request for event details
    axios.get.mockResolvedValue({
      data: {
        Title: "Old Event Title",
        Date: "2025-06-15T10:00:00.000Z",
        Location: "Old Location",
        Description: "Old description",
      },
    });

    // ✅ Mock PUT request for updating event
    axios.put.mockResolvedValue({
      data: { message: "Event updated successfully!" },
    });
  });

  test("allows user to update an event", async () => {
    render(
      <MemoryRouter initialEntries={["/events/1/edit"]}>
        <Routes>
          <Route path="/events/:id/edit" element={<EventUpdate />} />
        </Routes>
      </MemoryRouter>
    );

    // ✅ Wait for existing event data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Title:/i)).toHaveValue("Old Event Title");
    });

    // ✅ Simulate user updating event details
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: "Updated Event Title" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-06-15" } });
    fireEvent.change(screen.getByLabelText(/Time:/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: "Updated Location" } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Updated description." } });

    // ✅ Click the "Update Event" button correctly
    fireEvent.click(screen.getByRole("button", { name: /Update Event/i }));

    // ✅ Ensure API is called with the correct updated data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:8080/events/1",
        expect.objectContaining({
          Title: "Updated Event Title",
          Date: expect.stringMatching(/^2025-06-15T\d{2}:00:00.000Z$/), // ✅ Matches valid time format
          Location: "Updated Location",
          Description: "Updated description.",
        }),
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    // ✅ Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/✅ Event updated successfully!/i)).toBeInTheDocument();
    });
  });
});



