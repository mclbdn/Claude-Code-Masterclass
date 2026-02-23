"use client";

import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";

export default function HeistsPage() {
  const {
    heists: activeHeists,
    loading: activeLoading,
    error: activeError,
  } = useHeists("active");
  const {
    heists: assignedHeists,
    loading: assignedLoading,
    error: assignedError,
  } = useHeists("assigned");
  const {
    heists: expiredHeists,
    loading: expiredLoading,
    error: expiredError,
  } = useHeists("expired");

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeLoading && <p>Loading...</p>}
        {activeError && <p className="error">Error: {activeError}</p>}
        {!activeLoading && activeHeists.length === 0 && <p>No active heists</p>}
        <ul className="grid-layout" role="list">
          {activeHeists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </ul>
      </div>

      <div className="assigned-heists">
        <h2>Heists You've Assigned</h2>
        {assignedLoading && <p>Loading...</p>}
        {assignedError && <p className="error">Error: {assignedError}</p>}
        {!assignedLoading && assignedHeists.length === 0 && (
          <p>No assigned heists</p>
        )}
        <ul className="grid-layout" role="list">
          {assignedHeists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </ul>
      </div>

      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredLoading && <p>Loading...</p>}
        {expiredError && <p className="error">Error: {expiredError}</p>}
        {!expiredLoading && expiredHeists.length === 0 && (
          <p>No expired heists</p>
        )}
        <ul className="grid-layout" role="list">
          {expiredHeists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </ul>
      </div>
    </div>
  );
}
