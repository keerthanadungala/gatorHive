import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "../App"; 

describe("App Component", () => {
  test("renders the navbar", () => {
    render(<App />); 
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });
});


