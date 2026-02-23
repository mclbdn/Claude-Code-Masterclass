// preview page for newly created UI components
import Skeleton from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import HeistCard from "@/components/HeistCard";
import { Heist } from "@/types/firestore/heist";

export default function PreviewPage() {
  // Mock heist data for preview
  const mockHeists: Heist[] = [
    {
      id: "1",
      title: "Steal the Crown Jewels",
      description:
        "Infiltrate the Tower of London and retrieve the priceless Crown Jewels. This requires expert stealth and timing.",
      createdBy: "user1",
      createdByCodename: "Shadow",
      assignedTo: "user2",
      assignedToCodename: "Phoenix",
      createdAt: new Date("2026-02-20T10:00:00Z"),
      deadline: new Date("2026-02-28T10:00:00Z"),
      finalStatus: null,
    },
    {
      id: "2",
      title: "Hack the Mainframe",
      description: "Break into the secure database and extract the files.",
      createdBy: "user1",
      createdByCodename: "Shadow",
      assignedTo: "user3",
      assignedToCodename: "Ghost",
      createdAt: new Date("2026-02-15T10:00:00Z"),
      deadline: new Date("2026-02-20T10:00:00Z"),
      finalStatus: null,
    },
    {
      id: "3",
      title: "Museum Heist",
      description:
        "Successfully retrieved the ancient artifact from the museum's vault without triggering any alarms.",
      createdBy: "user1",
      createdByCodename: "Shadow",
      assignedTo: "user2",
      assignedToCodename: "Phoenix",
      createdAt: new Date("2026-02-10T10:00:00Z"),
      deadline: new Date("2026-02-15T10:00:00Z"),
      finalStatus: "success",
    },
    {
      id: "4",
      title: "Bank Vault Breach",
      description:
        "Attempt to break into the city bank vault was unsuccessful.",
      createdBy: "user1",
      createdByCodename: "Shadow",
      assignedTo: "user4",
      assignedToCodename: "Raven",
      createdAt: new Date("2026-02-08T10:00:00Z"),
      deadline: new Date("2026-02-12T10:00:00Z"),
      finalStatus: "failure",
    },
    {
      id: "5",
      title:
        "This is an extremely long heist title that demonstrates how the component handles overflow and long text content gracefully",
      description:
        "This heist also has a very long description that goes on and on explaining all the intricate details of the operation, the planning involved, the team members required, and all the possible scenarios that could occur during the execution. It should be truncated properly.",
      createdBy: "user1",
      createdByCodename: "Shadow",
      assignedTo: "user2",
      assignedToCodename: "Phoenix",
      createdAt: new Date("2026-02-18T10:00:00Z"),
      deadline: new Date("2026-03-01T10:00:00Z"),
      finalStatus: null,
    },
  ];

  return (
    <div className="page-content">
      <h2 className="mb-6">Preview</h2>

      <section className="mb-8">
        <h3 className="mb-4">Avatar Component</h3>
        <div className="flex gap-4 items-center">
          <div>
            <Avatar name="John" />
            <p className="text-sm mt-2">Simple name</p>
          </div>
          <div>
            <Avatar name="JohnDoe" />
            <p className="text-sm mt-2">PascalCase</p>
          </div>
          <div>
            <Avatar name="MaryJaneWatson" />
            <p className="text-sm mt-2">Multi-word</p>
          </div>
          <div>
            <Avatar name="alice" />
            <p className="text-sm mt-2">Lowercase</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4">Skeleton Component</h3>
        <div className="grid-layout">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4">HeistCard Component</h3>
        <div className="grid-layout">
          {mockHeists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </div>
        <div className="mt-6">
          <p className="text-sm text-body">
            Showing different states: active with time remaining, expired
            (grayed out), success badge, failure badge, and long text truncation
          </p>
        </div>
      </section>
    </div>
  );
}
