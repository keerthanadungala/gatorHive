import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "../App"; 
import { vi } from "vitest";

vi.mock("../hooks/useAuth", () => ({
  isAuthenticated: () => true,
}));


describe("App Component", () => {
  test("renders the navbar", () => {
    render(<App />); 
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("CreateEvent")).toBeInTheDocument();
  });
});


