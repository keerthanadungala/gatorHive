import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";
import Navbar from "../components/Navbar";
import { vi } from "vitest";

vi.mock("../hooks/useAuth", () => ({
  isAuthenticated: () => true,
}));

describe("Navbar Component", () => {
  test("renders all navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("CreateEvent")).toBeInTheDocument();
    expect(screen.getByText("ViewEvents")).toBeInTheDocument();
  });
});



