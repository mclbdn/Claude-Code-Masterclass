// preview page for newly created UI components
import Skeleton from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
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

      <section>
        <h3 className="mb-4">Skeleton Component</h3>
        <div className="grid-layout">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </section>
    </div>
  )
}
