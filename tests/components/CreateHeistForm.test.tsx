import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateHeistForm from "@/components/CreateHeistForm";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock useUser hook
const mockUser = {
  uid: "user-123",
  displayName: "TestAgent",
  email: "test@test.com",
};
vi.mock("@/hooks/useUser", () => ({
  useUser: () => ({ user: mockUser, loading: false }),
}));

// Mock Firestore utilities
const mockFetchUsers = vi.fn();
const mockCreateHeistDocument = vi.fn();
vi.mock("@/lib/firebase", () => ({
  fetchUsers: () => mockFetchUsers(),
  createHeistDocument: (data: any) => mockCreateHeistDocument(data),
}));

// Mock createHeist utility
const mockCreateHeist = vi.fn();
vi.mock("@/lib/utils/createHeist", () => ({
  createHeist: (
    formData: any,
    createdBy: string,
    createdByCodename: string,
    assignedToCodename: string,
  ) =>
    mockCreateHeist(formData, createdBy, createdByCodename, assignedToCodename),
}));

describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchUsers.mockResolvedValue([
      { id: "user-456", codename: "ShadowNinja" },
      { id: "user-789", codename: "GhostRunner" },
    ]);
    mockCreateHeistDocument.mockResolvedValue("heist-id-123");
    mockCreateHeist.mockReturnValue({
      title: "Test Heist",
      description: "Test Description",
      createdBy: "user-123",
      createdByCodename: "TestAgent",
      assignedTo: "user-456",
      assignedToCodename: "ShadowNinja",
      createdAt: {},
      deadline: {},
      finalStatus: null,
    });
  });

  it("renders all form fields", async () => {
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Assign To")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create heist/i }),
    ).toBeInTheDocument();
  });

  it("fetches and populates users dropdown", async () => {
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
    });

    const select = screen.getByLabelText("Assign To") as HTMLSelectElement;

    await waitFor(() => {
      expect(select.options.length).toBe(3); // "Select a user..." + 2 users
    });

    expect(select.options[0].text).toBe("Select a user...");
    expect(select.options[1].text).toBe("ShadowNinja");
    expect(select.options[2].text).toBe("GhostRunner");
  });

  it("filters out current logged-in user from dropdown", async () => {
    mockFetchUsers.mockResolvedValue([
      { id: "user-123", codename: "TestAgent" }, // Current user
      { id: "user-456", codename: "ShadowNinja" },
    ]);

    render(<CreateHeistForm />);

    await waitFor(() => {
      const select = screen.getByLabelText("Assign To") as HTMLSelectElement;
      expect(select.options.length).toBe(2); // "Select a user..." + 1 user (current user filtered out)
    });

    const select = screen.getByLabelText("Assign To") as HTMLSelectElement;
    expect(select.options[1].text).toBe("ShadowNinja");
    expect(
      Array.from(select.options).find((opt) => opt.text === "TestAgent"),
    ).toBeUndefined();
  });

  it("shows loading state while fetching users", async () => {
    let resolveUsers: any;
    mockFetchUsers.mockReturnValue(
      new Promise((resolve) => {
        resolveUsers = resolve;
      }),
    );

    render(<CreateHeistForm />);

    const select = screen.getByLabelText("Assign To") as HTMLSelectElement;
    expect(select.options[0].text).toBe("Loading users...");

    resolveUsers([{ id: "user-456", codename: "ShadowNinja" }]);

    await waitFor(() => {
      expect(select.options[0].text).toBe("Select a user...");
    });
  });

  it("shows validation error for empty title", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("shows validation error for empty description", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    expect(
      await screen.findByText("Description is required"),
    ).toBeInTheDocument();
  });

  it("shows validation error when no user selected", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Assign To")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    expect(
      await screen.findByText("Please select a user to assign this heist to"),
    ).toBeInTheDocument();
  });

  it("prevents submission with validation errors", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    expect(mockCreateHeist).not.toHaveBeenCalled();
    expect(mockCreateHeistDocument).not.toHaveBeenCalled();
  });

  it("calls createHeist with correct parameters on valid submission", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateHeist).toHaveBeenCalledWith(
        {
          title: "Bank Heist",
          description: "Rob the central bank",
          assignedTo: "user-456",
        },
        "user-123",
        "TestAgent",
        "ShadowNinja",
      );
    });
  });

  it("calls createHeistDocument with CreateHeistInput", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateHeistDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Heist",
          description: "Test Description",
          createdBy: "user-123",
          assignedTo: "user-456",
          finalStatus: null,
        }),
      );
    });
  });

  it("redirects to /heists on successful submission", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveCreate: any;
    mockCreateHeistDocument.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );

    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creating heist...")).toBeInTheDocument();
    });

    resolveCreate("heist-id-123");
  });

  it("shows error when users fetch fails", async () => {
    mockFetchUsers.mockRejectedValue(new Error("Network error"));

    render(<CreateHeistForm />);

    expect(
      await screen.findByText("Failed to load users. Please refresh the page."),
    ).toBeInTheDocument();
  });

  it("shows error when Firestore write fails", async () => {
    const user = userEvent.setup();
    mockCreateHeistDocument.mockRejectedValue(new Error("Firestore error"));

    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    expect(
      await screen.findByText("Failed to create heist. Please try again."),
    ).toBeInTheDocument();
  });

  it("preserves form data on error", async () => {
    const user = userEvent.setup();
    mockCreateHeistDocument.mockRejectedValue(new Error("Firestore error"));

    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      "Description",
    ) as HTMLTextAreaElement;
    const assignToSelect = screen.getByLabelText("Assign To");

    await user.type(titleInput, "Bank Heist");
    await user.type(descriptionInput, "Rob the central bank");
    await user.selectOptions(assignToSelect, "user-456");

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create heist. Please try again."),
      ).toBeInTheDocument();
    });

    expect(titleInput.value).toBe("Bank Heist");
    expect(descriptionInput.value).toBe("Rob the central bank");
  });

  it("sets aria-invalid on fields with errors", async () => {
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /create heist/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    expect(screen.getByLabelText("Description")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Assign To")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows empty state when no users available", async () => {
    mockFetchUsers.mockResolvedValue([]);

    render(<CreateHeistForm />);

    expect(
      await screen.findByText("No users available to assign heists to."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please create additional user accounts first."),
    ).toBeInTheDocument();
  });

  it("disables submit button when no users available", async () => {
    mockFetchUsers.mockResolvedValue([]);

    render(<CreateHeistForm />);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /create heist/i }),
      ).not.toBeInTheDocument();
    });
  });
});
