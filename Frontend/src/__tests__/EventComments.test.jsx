import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventComments from "../pages/EventComments";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");

describe("EventComments Component", () => {
  beforeEach(() => {
    localStorage.setItem("jwt_token", "mock-token");
    localStorage.setItem("user_email", "john@ufl.edu");
  });

  it("posts a new comment", async () => {
    axios.get.mockResolvedValue({ data: [] });

    axios.post.mockResolvedValue({
      data: {
        ID: 999,
        comment: "Looking forward to this!",
        CreatedAt: new Date().toISOString(),
        user: { name: "John", email: "john@ufl.edu" },
      },
    });

    render(<EventComments eventId={1} />);

    fireEvent.change(screen.getByPlaceholderText("Write your comment..."), {
      target: { value: "Looking forward to this!" },
    });

    fireEvent.click(screen.getByText("Post"));

    expect(await screen.findByText("Looking forward to this!")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("deletes a comment", async () => {
    const comment = {
      ID: 1,
      comment: "Please delete me",
      CreatedAt: new Date().toISOString(),
      user: { name: "John", email: "john@ufl.edu" },
    };

    axios.get.mockResolvedValue({ data: [comment] });
    axios.delete.mockResolvedValue({});

    render(<EventComments eventId={1} />);
    await screen.findByText("Please delete me");

    // Mock window.confirm to always return true
    vi.stubGlobal("confirm", () => true);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() =>
      expect(screen.queryByText("Please delete me")).not.toBeInTheDocument()
    );
  });
});
