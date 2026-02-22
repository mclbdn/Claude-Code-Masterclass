"use client";

import { useHeists } from "@/hooks/useHeists";

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
        <ul>
          {activeHeists.map((heist) => (
            <li key={heist.id}>{heist.title}</li>
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
        <ul>
          {assignedHeists.map((heist) => (
            <li key={heist.id}>{heist.title}</li>
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
        <ul>
          {expiredHeists.map((heist) => (
            <li key={heist.id}>{heist.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
