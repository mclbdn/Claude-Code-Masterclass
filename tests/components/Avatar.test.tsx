import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully", () => {
    render(<Avatar name="John" />)
    const avatar = screen.getByText("J")
    expect(avatar).toBeInTheDocument()
  })

  it("displays first letter for simple names", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("displays first two uppercase letters for PascalCase names", () => {
    render(<Avatar name="JohnDoe" />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("displays first two uppercase letters for multi-word PascalCase", () => {
    render(<Avatar name="MaryJaneWatson" />)
    expect(screen.getByText("MJ")).toBeInTheDocument()
  })
})
