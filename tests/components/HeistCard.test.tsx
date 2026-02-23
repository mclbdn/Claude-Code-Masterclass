import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HeistCard from "@/components/HeistCard";
import { Heist } from "@/types/firestore/heist";
import * as dateUtils from "@/lib/utils/dateUtils";

// Mock the date utilities
vi.mock("@/lib/utils/dateUtils", () => ({
  isExpired: vi.fn(),
  formatDeadline: vi.fn(),
  getTimeRemaining: vi.fn(),
}));

describe("HeistCard", () => {
  const mockHeist: Heist = {
    id: "test-heist-1",
    title: "Steal the Diamond",
    description:
      "This is a test heist description that might be quite long and needs proper handling in the UI component",
    createdBy: "user123",
    createdByCodename: "Shadow",
    assignedTo: "user456",
    assignedToCodename: "Phoenix",
    createdAt: new Date("2026-02-20T10:00:00Z"),
    deadline: new Date("2026-02-25T10:00:00Z"),
    finalStatus: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(dateUtils.isExpired).mockReturnValue(false);
    vi.mocked(dateUtils.formatDeadline).mockReturnValue("Feb 25, 2026");
    vi.mocked(dateUtils.getTimeRemaining).mockReturnValue("2d 5h");
  });

  it("renders heist title", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(screen.getByText("Steal the Diamond")).toBeInTheDocument();
  });

  it("renders heist description", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(
      screen.getByText(/This is a test heist description/),
    ).toBeInTheDocument();
  });

  it("renders assigned user codename", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(screen.getByText(/Phoenix/)).toBeInTheDocument();
  });

  it("renders formatted deadline", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(screen.getByText(/Feb 25, 2026/)).toBeInTheDocument();
  });

  it("shows time remaining for active heist", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(screen.getByText(/2d 5h left/)).toBeInTheDocument();
  });

  it("shows success badge for completed heist", () => {
    const completedHeist = { ...mockHeist, finalStatus: "success" as const };
    render(<HeistCard heist={completedHeist} />);
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows failure badge for failed heist", () => {
    const failedHeist = { ...mockHeist, finalStatus: "failure" as const };
    render(<HeistCard heist={failedHeist} />);
    expect(screen.getByText("Failure")).toBeInTheDocument();
  });

  it("does not show status badge for active heist", () => {
    render(<HeistCard heist={mockHeist} />);
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
    expect(screen.queryByText("Failure")).not.toBeInTheDocument();
  });

  it("does not show time remaining for completed heist", () => {
    const completedHeist = { ...mockHeist, finalStatus: "success" as const };
    vi.mocked(dateUtils.getTimeRemaining).mockReturnValue("2d 5h");
    render(<HeistCard heist={completedHeist} />);
    expect(screen.queryByText(/2d 5h left/)).not.toBeInTheDocument();
  });

  it("shows expired text for past deadline without status", () => {
    vi.mocked(dateUtils.isExpired).mockReturnValue(true);
    vi.mocked(dateUtils.getTimeRemaining).mockReturnValue(null);
    render(<HeistCard heist={mockHeist} />);
    expect(screen.getByText(/Expired/)).toBeInTheDocument();
  });

  it("does not show expired text for completed heist", () => {
    const completedHeist = { ...mockHeist, finalStatus: "success" as const };
    vi.mocked(dateUtils.isExpired).mockReturnValue(true);
    render(<HeistCard heist={completedHeist} />);
    expect(screen.queryByText(/Expired/)).not.toBeInTheDocument();
  });

  it("applies expired styles when deadline has passed", () => {
    vi.mocked(dateUtils.isExpired).mockReturnValue(true);
    const { container } = render(<HeistCard heist={mockHeist} />);
    const card = container.querySelector("article");
    expect(card?.className).toContain("cardExpired");
  });

  it("does not apply expired styles when deadline is in future", () => {
    vi.mocked(dateUtils.isExpired).mockReturnValue(false);
    const { container } = render(<HeistCard heist={mockHeist} />);
    const card = container.querySelector("article");
    expect(card?.className).not.toContain("cardExpired");
  });

  it("uses semantic article element", () => {
    const { container } = render(<HeistCard heist={mockHeist} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("handles very long title gracefully", () => {
    const longTitleHeist = {
      ...mockHeist,
      title:
        "This is an extremely long heist title that should be handled properly by the component without breaking the layout",
    };
    render(<HeistCard heist={longTitleHeist} />);
    expect(
      screen.getByText(/This is an extremely long heist title/),
    ).toBeInTheDocument();
  });
});
