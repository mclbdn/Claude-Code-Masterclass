import { describe, it, expect } from "vitest";
import { generateCodename } from "@/lib/utils";

describe("generateCodename", () => {
  it("generates a codename with PascalCase format", () => {
    const codename = generateCodename();

    // Check starts with uppercase
    expect(codename[0]).toMatch(/[A-Z]/);

    // Check contains no spaces
    expect(codename).not.toContain(" ");

    // Check is all letters (no numbers or special chars)
    expect(codename).toMatch(/^[A-Za-z]+$/);
  });

  it("generates unique codenames on multiple calls", () => {
    const codenames = new Set();

    for (let i = 0; i < 100; i++) {
      codenames.add(generateCodename());
    }

    // With 20 words per set, we have 8000 combinations
    // 100 calls should produce at least 90 unique values
    expect(codenames.size).toBeGreaterThan(90);
  });

  it("generates a non-empty string", () => {
    const codename = generateCodename();

    expect(codename.length).toBeGreaterThan(0);
  });
});
