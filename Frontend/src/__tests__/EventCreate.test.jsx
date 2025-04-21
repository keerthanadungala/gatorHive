import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import axios from "axios";
import EventCreate from "../pages/EventCreate";


vi.mock("axios");

describe("EventCreate Component", () => {
  test("allows user to fill and submit the form", async () => {

    axios.post.mockResolvedValueOnce({ data: { message: "Event Created" } });

    render(<EventCreate />);


    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: "Test Event" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-06-15" } });
    fireEvent.change(screen.getByLabelText(/Time:/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/Location:/i), { target: { value: "UF Hall" } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: "This is a test event." } });
    fireEvent.change(screen.getByLabelText(/capacity/i), {
      target: { value: "100" },
    });
    

    fireEvent.click(screen.getByText(/Create Event/i));


    await waitFor(() => {
      expect(screen.getByText(/🎉 Event created successfully!/i)).toBeInTheDocument();
    });
  });
});



