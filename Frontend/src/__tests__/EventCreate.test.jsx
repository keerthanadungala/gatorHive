import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import axios from "axios";
import EventCreate from "../pages/EventCreate";

// ✅ Mock Axios to prevent real API calls
vi.mock("axios");

describe("EventCreate Component", () => {
  test("allows user to fill and submit the form", async () => {
    // ✅ Mock the POST request
    axios.post.mockResolvedValueOnce({ data: { message: "Event Created" } });

    render(<EventCreate />);

    // ✅ Fill out the form
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: "Test Event" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-06-15" } });
    fireEvent.change(screen.getByLabelText(/Time:/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: "UF Hall" } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "This is a test event." } });

    // ✅ Submit the form
    fireEvent.click(screen.getByText(/Create Event/i));

    // ✅ Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/🎉 Event created successfully!/i)).toBeInTheDocument();
    });
  });
});



