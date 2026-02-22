# Implementation Plan: useHeists Hook

## Context

The heists page currently displays placeholder sections for "Your Active Heists", "Heists You've Assigned", and "All Expired Heists". We need to populate these sections with real data from Firestore by creating a custom React hook that provides real-time access to heists with three filtering modes:

- **active**: Heists assigned TO the current user where the deadline has not passed
- **assigned**: Heists created BY the current user where the deadline has not passed
- **expired**: All heists where the deadline has passed AND finalStatus is not null

This hook will follow the existing patterns established in the codebase (AuthContext, useUser) and integrate seamlessly with the Firebase/Firestore setup.

## Implementation Approach

### 1. Create useHeists Hook

**Location**: `hooks/useHeists/useHeists.ts` + `hooks/useHeists/index.ts`

**Pattern**: Follow the established hook pattern from `hooks/useUser/`
- Use "use client" directive
- Export from index.ts for clean imports
- Integrate with `useUser()` for auth state
- Return `{ heists: Heist[], loading: boolean, error: string }`

**Query Strategy**:
- Use Firestore `onSnapshot()` for real-time subscriptions (pattern from `context/AuthContext/AuthContext.tsx`)
- Build dynamic queries based on filter parameter using `query()` and `where()` clauses
- Apply existing `heistConverter` from `types/firestore/heist.ts` for Timestamp→Date conversion
- Use `Timestamp.now()` for deadline comparisons

**Filter Implementation**:
- **active**: `where("assignedTo", "==", user.uid) + where("deadline", ">", Timestamp.now())`
- **assigned**: `where("createdBy", "==", user.uid) + where("deadline", ">", Timestamp.now())`
- **expired**: `where("deadline", "<=", Timestamp.now())` + client-side filter for `finalStatus !== null`

Note: The expired filter uses client-side filtering for finalStatus because Firestore's `!= null` operator would require an additional composite index and is less efficient than post-query filtering.

**Auth Handling**:
- Wait for `authLoading` to complete before querying
- Return empty state `{ heists: [], loading: false, error: "" }` when no user is authenticated
- Access current user via `useUser()` hook

**Cleanup**:
- Return unsubscribe function from useEffect to prevent memory leaks
- Re-subscribe when filter or user changes

### 2. Update Heists Page

**Location**: `app/(dashboard)/heists/page.tsx`

**Changes**:
- Add "use client" directive
- Call `useHeists()` three times with different filters
- Destructure returns with unique names (activeHeists, assignedHeists, expiredHeists)
- Display heist titles in appropriate sections
- Show loading states per section
- Show error messages if queries fail
- Show empty state messages when no heists exist

### 3. Firestore Composite Indexes

**Required indexes** (Firestore will prompt on first use):
- Collection: `heists`, Fields: `assignedTo` (Ascending), `deadline` (Ascending)
- Collection: `heists`, Fields: `createdBy` (Ascending), `deadline` (Ascending)

When the hook first runs, Firestore will throw an error with a link to create the index. Click the link and wait 1-2 minutes for index creation.

### 4. Testing

**Location**: `tests/hooks/useHeists.test.tsx`

**Test cases**:
- Returns loading state while auth is loading
- Returns empty when no user authenticated
- Builds correct query for each filter mode
- Handles snapshot updates and populates heists array
- Handles errors from Firestore
- Cleans up subscription on unmount
- Re-subscribes when filter changes
- Filters out expired heists without finalStatus (client-side)

**Pattern**: Use `renderHook` from `@testing-library/react`, mock `useUser` and `onSnapshot`

## Critical Files

### Files to Create:
1. **`hooks/useHeists/useHeists.ts`**
   - Core hook implementation
   - Query construction based on filter mode
   - Real-time subscription with onSnapshot
   - State management: heists[], loading, error
   - Integration with useUser for auth

2. **`hooks/useHeists/index.ts`**
   - Export: `export { useHeists } from "./useHeists"`

3. **`tests/hooks/useHeists.test.tsx`**
   - Comprehensive tests for all filter modes
   - Auth state handling tests
   - Subscription cleanup tests

### Files to Modify:
1. **`app/(dashboard)/heists/page.tsx`**
   - Convert to client component ("use client")
   - Import and use useHeists hook three times
   - Replace placeholder content with real data
   - Add loading/error/empty states

### Files Referenced (existing patterns):
- `hooks/useUser/useUser.ts` - Hook structure pattern
- `context/AuthContext/AuthContext.tsx` - onSnapshot cleanup pattern (lines 14-29)
- `types/firestore/heist.ts` - Heist type and heistConverter
- `types/firestore/index.ts` - COLLECTIONS constant
- `lib/firebase/index.ts` - Firebase db export

## Key Implementation Details

### Hook Structure:

```typescript
"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore"
import { useUser } from "@/hooks/useUser"

type FilterMode = "active" | "assigned" | "expired"

export function useHeists(filter: FilterMode) {
  const { user, loading: authLoading } = useUser()
  const [heists, setHeists] = useState<Heist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Wait for auth
    if (authLoading) {
      setLoading(true)
      return
    }

    // No user authenticated
    if (!user) {
      setHeists([])
      setLoading(false)
      return
    }

    // Build query
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)
    const now = Timestamp.now()

    let q
    if (filter === "active") {
      q = query(heistsRef,
        where("assignedTo", "==", user.uid),
        where("deadline", ">", now))
    } else if (filter === "assigned") {
      q = query(heistsRef,
        where("createdBy", "==", user.uid),
        where("deadline", ">", now))
    } else {
      q = query(heistsRef,
        where("deadline", "<=", now))
    }

    setLoading(true)
    setError("")

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let heistDocs = snapshot.docs.map(doc => doc.data())

        // Client-side filter for expired: only show heists with finalStatus
        if (filter === "expired") {
          heistDocs = heistDocs.filter(h => h.finalStatus !== null)
        }

        setHeists(heistDocs)
        setLoading(false)
      },
      (err) => {
        console.error(`Error fetching ${filter} heists:`, err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [filter, user, authLoading])

  return { heists, loading, error }
}
```

### Page Usage Pattern:

```typescript
"use client"

import { useHeists } from "@/hooks/useHeists"

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading, error: activeError } = useHeists("active")
  const { heists: assignedHeists, loading: assignedLoading, error: assignedError } = useHeists("assigned")
  const { heists: expiredHeists, loading: expiredLoading, error: expiredError } = useHeists("expired")

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeLoading && <p>Loading...</p>}
        {activeError && <p className="error">Error: {activeError}</p>}
        {!activeLoading && activeHeists.length === 0 && <p>No active heists</p>}
        <ul>
          {activeHeists.map(heist => <li key={heist.id}>{heist.title}</li>)}
        </ul>
      </div>

      <div className="assigned-heists">
        <h2>Heists You've Assigned</h2>
        {assignedLoading && <p>Loading...</p>}
        {assignedError && <p className="error">Error: {assignedError}</p>}
        {!assignedLoading && assignedHeists.length === 0 && <p>No assigned heists</p>}
        <ul>
          {assignedHeists.map(heist => <li key={heist.id}>{heist.title}</li>)}
        </ul>
      </div>

      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredLoading && <p>Loading...</p>}
        {expiredError && <p className="error">Error: {expiredError}</p>}
        {!expiredLoading && expiredHeists.length === 0 && <p>No expired heists</p>}
        <ul>
          {expiredHeists.map(heist => <li key={heist.id}>{heist.title}</li>)}
        </ul>
      </div>
    </div>
  )
}
```

## Edge Cases Handled

1. **Unauthenticated user**: Returns empty state without errors
2. **Auth loading**: Shows loading state until auth resolves
3. **Network errors**: Caught by onSnapshot error handler, displayed to user
4. **Firestore permission errors**: Handled in error callback
5. **Invalid deadline dates**: heistConverter will throw, caught by error handler
6. **Expired heists without finalStatus**: Filtered out client-side
7. **Component unmount**: Subscription cleaned up via useEffect return
8. **Filter changes**: Old subscription cleaned up, new one started

## Verification

### Manual Testing:
1. Run `npm run dev` and navigate to `/heists`
2. Verify three sections display correctly
3. Create a new heist via `/heists/create`
   - Should appear in "Heists You've Assigned" section
4. Switch to another user account
   - Should see the heist in "Your Active Heists" section
5. Test real-time updates:
   - Open `/heists` in two browser tabs with different users
   - Create a heist in one tab
   - Verify it appears in the other tab without refresh
6. Test loading states by throttling network in DevTools
7. Test error handling by going offline
8. Wait for a heist deadline to pass (or manually update in Firestore)
   - Should move to expired section only if finalStatus is set

### Automated Testing:
```bash
npm test -- tests/hooks/useHeists.test.tsx
```

### Firestore Index Creation:
- On first load, Firestore will display console errors with index creation links
- Click the links to create composite indexes
- Wait 1-2 minutes for index creation
- Refresh the page to verify queries work

### Expected Behavior:
- Active section shows heists assigned TO current user (future deadlines)
- Assigned section shows heists created BY current user (future deadlines)
- Expired section shows all heists with past deadlines that have finalStatus
- All sections update in real-time when data changes
- Loading states appear briefly during initial load
- Empty states show when no heists match filter
- Error messages display if Firestore queries fail
