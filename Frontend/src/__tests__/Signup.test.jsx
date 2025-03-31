import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../components/SignUp";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");

describe("Signup Component", () => {
  it("shows error if fields are empty", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/create account/i));
    expect(screen.getByText(/fill in all fields/i)).toBeInTheDocument();
  });

  it("shows error if passwords do not match", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Name:"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "alice@ufl.edu" } });
    fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "test123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password:"), { target: { value: "wrongpass" } });

    fireEvent.click(screen.getByText(/create account/i));
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("submits successfully with valid data", async () => {
    axios.post.mockResolvedValue({ status: 200 });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Name:"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "alice@ufl.edu" } });
    fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "test123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password:"), { target: { value: "test123" } });

    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    );
  });
});
