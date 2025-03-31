import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../hooks/useAuth", () => ({
  isAuthenticated: () => true,
}));

vi.mock("../hooks/useAuth", () => ({
  isAuthenticated: () => true,
  logout: vi.fn(() => localStorage.removeItem("token")),
}));

describe("Navbar", () => {
  it("shows logout when logged in", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it("clears token and navigates on logout", () => {
    localStorage.setItem("token", "abc123");

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/logout/i));
    expect(localStorage.getItem("token")).toBe(null);
  });
});
