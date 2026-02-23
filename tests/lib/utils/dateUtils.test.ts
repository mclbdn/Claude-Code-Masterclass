import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatDeadline,
  getTimeRemaining,
  isExpired,
} from "@/lib/utils/dateUtils";

describe("dateUtils", () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing: Feb 23, 2026, 12:00:00
    vi.setSystemTime(new Date("2026-02-23T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDeadline", () => {
    it("formats date correctly", () => {
      const date = new Date("2026-03-15T10:00:00Z");
      const formatted = formatDeadline(date);
      expect(formatted).toBe("Mar 15, 2026");
    });

    it("handles different months correctly", () => {
      const date = new Date("2026-12-31T10:00:00Z");
      const formatted = formatDeadline(date);
      expect(formatted).toBe("Dec 31, 2026");
    });

    it("handles single digit days correctly", () => {
      const date = new Date("2026-01-05T10:00:00Z");
      const formatted = formatDeadline(date);
      expect(formatted).toBe("Jan 5, 2026");
    });
  });

  describe("isExpired", () => {
    it("returns false for future deadline", () => {
      const futureDate = new Date("2026-02-25T12:00:00Z");
      expect(isExpired(futureDate)).toBe(false);
    });

    it("returns true for past deadline", () => {
      const pastDate = new Date("2026-02-20T12:00:00Z");
      expect(isExpired(pastDate)).toBe(true);
    });

    it("returns true for deadline exactly at current time", () => {
      const nowDate = new Date("2026-02-23T12:00:00Z");
      expect(isExpired(nowDate)).toBe(true);
    });
  });

  describe("getTimeRemaining", () => {
    it("returns null for past deadline", () => {
      const pastDate = new Date("2026-02-20T12:00:00Z");
      expect(getTimeRemaining(pastDate)).toBe(null);
    });

    it("returns days and hours for deadline more than 24 hours away", () => {
      // 2 days and 6 hours from now
      const futureDate = new Date("2026-02-25T18:00:00Z");
      expect(getTimeRemaining(futureDate)).toBe("2d 6h");
    });

    it("returns hours and minutes for deadline less than 24 hours away", () => {
      // 5 hours and 30 minutes from now
      const futureDate = new Date("2026-02-23T17:30:00Z");
      expect(getTimeRemaining(futureDate)).toBe("5h 30m");
    });

    it("returns only minutes for deadline less than 1 hour away", () => {
      // 45 minutes from now
      const futureDate = new Date("2026-02-23T12:45:00Z");
      expect(getTimeRemaining(futureDate)).toBe("45m");
    });

    it("returns 1m for deadline less than 1 minute away", () => {
      // 30 seconds from now
      const futureDate = new Date("2026-02-23T12:00:30Z");
      expect(getTimeRemaining(futureDate)).toBe("1m");
    });

    it("handles exactly 1 day remaining", () => {
      const futureDate = new Date("2026-02-24T12:00:00Z");
      expect(getTimeRemaining(futureDate)).toBe("1d 0h");
    });

    it("handles exactly 1 hour remaining", () => {
      const futureDate = new Date("2026-02-23T13:00:00Z");
      expect(getTimeRemaining(futureDate)).toBe("1h 0m");
    });

    it("rounds down partial hours and minutes", () => {
      // 2 days, 3 hours, 45 minutes from now
      const futureDate = new Date("2026-02-25T15:45:00Z");
      expect(getTimeRemaining(futureDate)).toBe("2d 3h");
    });
  });
});
