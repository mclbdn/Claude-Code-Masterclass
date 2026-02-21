import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PublicLayout from "@/app/(public)/layout";

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

import { useUser } from "@/hooks/useUser";

describe("PublicLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
  });

  it("renders children for unauthenticated users", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("redirects authenticated users to /heists", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test" },
      loading: false,
    });

    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows loading spinner during redirect for authenticated users", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@example.com", displayName: "Test" },
      loading: false,
    });

    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>,
    );

    // Should show loading state, not the content
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
  });

  it("does not redirect during initial loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
