import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest"; 
import EventUpdate from "../pages/EventUpdate";


vi.mock("axios");

describe("EventUpdate Component", () => {
  beforeEach(() => {

    axios.get.mockResolvedValue({
      data: {
        Title: "Old Event Title",
        Date: "2025-06-15T10:00:00.000Z",
        Location: "Old Location",
        Description: "Old description",
      },
    });


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


    await waitFor(() => {
      expect(screen.getByLabelText(/Title:/i)).toHaveValue("Old Event Title");
    });


    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: "Updated Event Title" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-06-15" } });
    fireEvent.change(screen.getByLabelText(/Time:/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: "Updated Location" } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "Updated description." } });
    fireEvent.change(screen.getByLabelText(/capacity/i), {
      target: { value: "100" },
    });
    

    fireEvent.click(screen.getByRole("button", { name: /Update Event/i }));


    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:8080/events/1",
        expect.objectContaining({
          Title: "Updated Event Title",
          Date: expect.stringMatching(/^2025-06-15T\d{2}:00:00.000Z$/), 
          Location: "Updated Location",
          Description: "Updated description.",
        }),
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        })
      );
    });


    await waitFor(() => {
      expect(screen.getByText(/✅ Event updated successfully!/i)).toBeInTheDocument();
    });
  });
});



