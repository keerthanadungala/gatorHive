import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../components/Login";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";

// Mock axios and localStorage
vi.mock("axios");

beforeEach(() => {
  // Clear mocks before each test
  vi.restoreAllMocks();

  // Mock localStorage
  const localStorageMock = (function () {
    let store = {};

    return {
      getItem: vi.fn((key) => store[key]),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
});

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.localStorage.__proto__, "setItem");
  });

  it("shows error when email or password is missing", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByText(/please enter both/i)).toBeInTheDocument();
  });

  it("logs in successfully with correct credentials", async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: { token: "abc123" },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@gatorhive.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Login"));

<<<<<<< Updated upstream
    await waitFor(() =>
      expect(screen.getByText(/login successful/i)).toBeInTheDocument()
    );

    expect(localStorage.setItem).toHaveBeenNthCalledWith(1, "jwt_token", "abc123");
    expect(localStorage.setItem).toHaveBeenNthCalledWith(2, "user_email", "user@gatorhive.com");
    expect(localStorage.getItem("jwt_token")).toBe("abc123");
=======
    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("jwt_token", "abc123");
    expect(localStorage.setItem).toHaveBeenCalledWith("user_email", "user@gatorhive.com");
>>>>>>> Stashed changes
  });
});
