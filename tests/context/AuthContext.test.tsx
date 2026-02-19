import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { useContext } from "react";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides initial loading state", async () => {
    (onAuthStateChanged as Mock).mockImplementation(() => vi.fn());

    function TestComponent() {
      const context = useContext(AuthContext);
      if (!context) return <div>no context</div>;
      const { loading } = context;
      return <div>{loading ? "loading" : "ready"}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("provides authenticated user state", async () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };

    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    });

    function TestComponent() {
      const context = useContext(AuthContext);
      if (!context) return <div>no context</div>;
      const { user, loading } = context;
      return <div>{!loading && user ? user.email : "no user"}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("provides null user when not authenticated", async () => {
    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });

    function TestComponent() {
      const context = useContext(AuthContext);
      if (!context) return <div>no context</div>;
      const { user, loading } = context;
      return <div>{!loading && !user ? "logged out" : "logged in"}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("logged out")).toBeInTheDocument();
    });
  });

  it("cleans up listener on unmount", () => {
    const unsubscribe = vi.fn();
    (onAuthStateChanged as Mock).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <div>test</div>
      </AuthProvider>,
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("provides same state to multiple consumers", async () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      displayName: "Test User",
    };

    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    });

    function FirstComponent() {
      const context = useContext(AuthContext);
      if (!context) return <div>no context</div>;
      const { user } = context;
      return <div data-testid="first">{user?.email || "none"}</div>;
    }

    function SecondComponent() {
      const context = useContext(AuthContext);
      if (!context) return <div>no context</div>;
      const { user } = context;
      return <div data-testid="second">{user?.email || "none"}</div>;
    }

    render(
      <AuthProvider>
        <FirstComponent />
        <SecondComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("second")).toHaveTextContent(
        "test@example.com",
      );
    });
  });
});
