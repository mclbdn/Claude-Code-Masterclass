import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useUser } from "@/hooks/useUser";
import { AuthProvider } from "@/context/AuthContext";
import type { Mock } from "vitest";
import { onAuthStateChanged } from "firebase/auth";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

describe("useUser", () => {
  it("throws error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow("useUser must be used within an AuthProvider");
  });

  it("returns auth state when used within AuthProvider", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("loading");
  });

  it("returns loading true initially", () => {
    (onAuthStateChanged as Mock).mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useUser(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });
});
