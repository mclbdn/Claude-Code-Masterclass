import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHeists } from "@/hooks/useHeists";
import { onSnapshot, Timestamp } from "firebase/firestore";
import { useUser } from "@/hooks/useUser";

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    collection: vi.fn(() => ({
      withConverter: vi.fn((converter) => ({})),
    })),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    },
  };
});

vi.mock("@/hooks/useUser");
vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state while auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });

    const { result } = renderHook(() => useHeists("active"));

    expect(result.current.loading).toBe(true);
    expect(result.current.heists).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("returns empty state when no user authenticated", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useHeists("active"));

    expect(result.current.loading).toBe(false);
    expect(result.current.heists).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("subscribes to Firestore when user is authenticated", () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe = vi.fn();

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

    renderHook(() => useHeists("active"));

    expect(onSnapshot).toHaveBeenCalled();
  });

  it("returns heists from snapshot", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe = vi.fn();
    const mockHeists = [
      {
        id: "heist1",
        title: "Bank Heist",
        description: "Rob the bank",
        createdBy: "user456",
        createdByCodename: "Boss",
        assignedTo: "user123",
        assignedToCodename: "Hacker",
        createdAt: new Date(),
        deadline: new Date(Date.now() + 86400000),
        finalStatus: null,
      },
    ];

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot).mockImplementation((q, onNext) => {
      onNext({
        docs: mockHeists.map((heist) => ({
          data: () => heist,
        })),
      } as any);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHeists("active"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.heists).toEqual(mockHeists);
    expect(result.current.error).toBe("");
  });

  it("filters out expired heists without finalStatus", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe = vi.fn();
    const mockHeists = [
      {
        id: "heist1",
        title: "Completed Heist",
        description: "Done",
        createdBy: "user123",
        createdByCodename: "Boss",
        assignedTo: "user456",
        assignedToCodename: "Hacker",
        createdAt: new Date(),
        deadline: new Date(Date.now() - 86400000),
        finalStatus: "success" as const,
      },
      {
        id: "heist2",
        title: "Incomplete Heist",
        description: "Not done",
        createdBy: "user123",
        createdByCodename: "Boss",
        assignedTo: "user456",
        assignedToCodename: "Hacker",
        createdAt: new Date(),
        deadline: new Date(Date.now() - 86400000),
        finalStatus: null,
      },
    ];

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot).mockImplementation((q, onNext) => {
      onNext({
        docs: mockHeists.map((heist) => ({
          data: () => heist,
        })),
      } as any);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHeists("expired"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.heists).toHaveLength(1);
    expect(result.current.heists[0].id).toBe("heist1");
  });

  it("handles Firestore errors", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe = vi.fn();
    const mockError = new Error("Firestore error");

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot).mockImplementation((q, onNext, onError) => {
      if (onError) onError(mockError);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHeists("active"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Firestore error");
    expect(result.current.heists).toEqual([]);
  });

  it("cleans up subscription on unmount", () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe = vi.fn();

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useHeists("active"));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("re-subscribes when filter changes", () => {
    const mockUser = {
      uid: "user123",
      email: "test@test.com",
      displayName: "Test User",
    };
    const mockUnsubscribe1 = vi.fn();
    const mockUnsubscribe2 = vi.fn();

    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(onSnapshot)
      .mockReturnValueOnce(mockUnsubscribe1)
      .mockReturnValueOnce(mockUnsubscribe2);

    const { rerender } = renderHook(({ filter }) => useHeists(filter), {
      initialProps: { filter: "active" as const },
    });

    expect(onSnapshot).toHaveBeenCalledTimes(1);

    rerender({ filter: "assigned" as const });

    expect(mockUnsubscribe1).toHaveBeenCalled();
    expect(onSnapshot).toHaveBeenCalledTimes(2);
  });
});
