import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";
import Navbar from "../components/Navbar";

describe("Navbar Component", () => {
  test("renders all navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
    expect(screen.getByText("View Events")).toBeInTheDocument();
  });
});



