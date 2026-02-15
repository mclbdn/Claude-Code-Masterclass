// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Small pranks. Epic chaos.</div>
        <p className="mt-6 max-w-md text-center text-body">
          Welcome to Pocket Heist — the ultimate platform for pulling off
          harmless office capers. Assign sneaky missions to your coworkers,
          track their progress, and earn bragging rights for completed heists.
          Whether it&apos;s swapping someone&apos;s desktop wallpaper or hiding
          all the staples, no mission is too small.
        </p>
      </div>
    </div>
  )
}
