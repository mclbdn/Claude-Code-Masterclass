import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// component imports
import Navbar from "@/components/Navbar";

// Mock hooks and Firebase
const mockSignOut = vi.fn();

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signOut: () => mockSignOut(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

import { useUser } from "@/hooks/useUser";

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is logged in
    vi.mocked(useUser).mockReturnValue({
      user: {
        uid: "123",
        email: "test@example.com",
        displayName: "TestUser",
      },
      loading: false,
    });
  });

  it("renders the main heading", () => {
    render(<Navbar />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Create Heist link", () => {
    render(<Navbar />);

    const createLink = screen.getByRole("link", { name: /create heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });

  it("shows logout button when user is logged in", () => {
    render(<Navbar />);

    const logoutButton = screen.getByRole("button", { name: /log out/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("hides logout button when user is logged out", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Navbar />);

    const logoutButton = screen.queryByRole("button", { name: /log out/i });
    expect(logoutButton).not.toBeInTheDocument();
  });

  it("calls signOut when logout button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const logoutButton = screen.getByRole("button", { name: /log out/i });
    await user.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows loading state when logging out", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const logoutButton = screen.getByRole("button", { name: /log out/i });
    await user.click(logoutButton);

    expect(screen.getByText("Logging out...")).toBeInTheDocument();
    expect(logoutButton).toBeDisabled();
  });
});
