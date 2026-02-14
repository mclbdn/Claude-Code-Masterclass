export default function Skeleton() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-header-text">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-subtitle" />
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-full" />
        <div className="skeleton-line skeleton-full" />
        <div className="skeleton-line skeleton-medium" />
      </div>
    </div>
  )
}
