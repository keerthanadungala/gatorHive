import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../components/Home";

describe("Home Component", () => {
  test("renders correctly", () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to GatorHive/i)).toBeInTheDocument();
  });
});



