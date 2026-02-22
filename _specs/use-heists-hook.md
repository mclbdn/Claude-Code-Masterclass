# Spec for Use Heists Hook

branch: claude/feature/use-heists-hook

## Summary

Create a custom React hook `useHeists` that provides real-time access to heists data from the Firestore collection. The hook will support three filtering modes: 'active' (heists assigned to the current user), 'assigned' (heists created by the current user), and 'expired' (completed heists). The hook will be integrated into the heists page to display filtered lists of heist titles.

## Functional Requirements

- Create a hook file at `hooks/useHeists.ts` (or `hooks/useHeists/useHeists.ts` following component pattern)
- Hook accepts a single parameter: `filter: 'active' | 'assigned' | 'expired'`
- Hook returns an object with:
  - `heists`: Array of Heist objects
  - `loading`: Boolean indicating data fetch status
  - `error`: Error object if query fails
- Hook subscribes to real-time Firestore updates using `onSnapshot`
- Hook automatically unsubscribes when component unmounts
- Filter behavior:
  - **'active'**: Query heists where `assignedTo === currentUser.uid` AND `deadline > now`
  - **'assigned'**: Query heists where `createdBy === currentUser.uid` AND `deadline > now`
  - **'expired'**: Query heists where `deadline <= now` AND `finalStatus !== null` (regardless of user)
- Hook uses Firebase Auth to get current user ID
- Update `app/(dashboard)/heists/page.tsx` to:
  - Use the hook three times with different filters
  - Display heist titles in the appropriate sections (active, assigned, expired)
  - Show loading states while data is being fetched
  - Handle error states appropriately

## Possible Edge Cases

- User not authenticated when hook is called
- Firestore collection is empty
- Network errors during real-time subscription
- Component unmounts before data loads
- User ID changes during component lifecycle
- Invalid or missing deadline dates in heist documents
- Missing finalStatus field on expired heists
- Clock skew between client and server (deadline comparisons)
- Multiple heists with same title
- Very large result sets (performance considerations)

## Acceptance Criteria

- Hook successfully queries Firestore with appropriate filters
- Real-time updates are reflected in the UI when heists change
- Loading state is shown while initial data is being fetched
- Error states are handled and displayed to user
- Memory leaks are prevented (subscriptions cleaned up)
- Page displays correct heist titles in each section
- Active heists section shows only heists assigned TO current user
- Assigned heists section shows only heists created BY current user
- Expired heists section shows all expired heists with final status
- Hook can be reused in other components if needed

## Open Questions

- Should the hook support pagination for large datasets? no
- Should there be a limit on the number of heists returned? no
- How should we handle heists with missing or invalid deadline dates? up to you
- Should we cache query results to reduce Firestore reads? no
- Do we need to sort the heists (by deadline, creation date, etc.)? no
- Should the hook support combining multiple filters? no

## Testing Guidelines

Create a test file in `./tests/hooks/useHeists.test.tsx` for the new hook, and create meaningful tests for the following cases:

- Hook returns empty array when no heists match filter
- Hook returns correct heists for 'active' filter
- Hook returns correct heists for 'assigned' filter
- Hook returns correct heists for 'expired' filter
- Hook sets loading to true initially and false after data loads
- Hook handles Firestore errors and sets error state
- Hook unsubscribes from Firestore when component unmounts
- Hook updates when real-time data changes
- Hook handles unauthenticated user scenario

Create a test file in `./tests/app/heists/page.test.tsx` for the updated page:

- Page renders three sections with correct headings
- Page displays heist titles from hook results
- Page shows loading state while data is being fetched
- Page handles empty results for each section
