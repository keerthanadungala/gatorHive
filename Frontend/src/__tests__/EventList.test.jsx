import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import EventList from "../pages/EventList";

describe("EventList Component", () => {
  test("renders list of events", () => {
    render(<EventList />);
    expect(screen.getByText(/📋 Upcoming Gator Events/i)).toBeInTheDocument();
  });
});




