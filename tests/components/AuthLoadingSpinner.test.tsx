import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

describe("AuthLoadingSpinner", () => {
  it("renders loading text", () => {
    render(<AuthLoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders clock icon", () => {
    const { container } = render(<AuthLoadingSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
