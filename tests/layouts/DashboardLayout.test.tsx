import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardLayout from "@/app/(dashboard)/layout";

// Mock dependencies
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

import { useUser } from "@/hooks/useUser";

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });

  it("renders Navbar and children for authenticated users", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test" },
      loading: false,
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading spinner during redirect for unauthenticated users", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    // Should show loading state, not the content
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });

  it("does not redirect during initial loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test" },
      loading: true,
    });

    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
