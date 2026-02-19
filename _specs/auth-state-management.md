# Spec for Global Auth State Management

branch: claude/feature/auth-state-management

## Summary

Implement a global auth state management solution that provides a `useUser` hook accessible throughout the application. This hook exposes the current authenticated user state (user object when logged in, null when logged out) via a realtime listener. The solution enables any component or page to reactively access authentication state without prop drilling.

## Functional Requirements

- Create a `useUser()` hook that can be imported and used in any component or page
- The hook returns `null` when the user is logged out
- The hook returns a user object when the user is logged in
- Implement a global realtime listener that updates user state automatically when authentication status changes
- The state management should use React Context API or similar pattern to provide global access
- Ensure the solution works seamlessly with Next.js App Router (server and client components)
- Refactor existing components that currently access user data to use the new `useUser` hook
- The hook should provide TypeScript type safety for the user object

## Possible Edge Cases

- Initial loading state before auth status is determined (should handle loading/undefined state)
- Rapid auth state changes (login/logout in quick succession)
- Hook called from server components where it's not applicable
- Multiple components subscribing to auth state simultaneously
- Memory leaks from listener subscriptions not being cleaned up
- Auth state persistence across page refreshes
- Race conditions between initial render and auth state initialization

## Acceptance Criteria

- A `useUser` hook is available and can be imported from a centralized location (e.g., `@/hooks/useUser`)
- The hook returns `{ user: User | null, loading: boolean }` with proper TypeScript types
- A provider component wraps the application to manage global auth state
- The realtime listener updates all subscribed components when auth state changes
- All existing components that access user data are updated to use `useUser`
- No prop drilling is required to access user state
- The solution is documented with usage examples
- Client components marked with 'use client' directive where necessary
- No console errors or warnings related to auth state management

## Open Questions

- Should we implement optimistic updates for auth state changes? no
- Do we need server-side session validation in addition to client-side state? no
- Should the hook expose additional auth methods (refresh token, check permissions)? no
- What should be the structure of the user object (minimal vs. full profile)? email, uid, displayName

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` hook returns null when user is logged out
- `useUser` hook returns user object when user is logged in
- Multiple components using `useUser` receive the same state
- Auth state updates propagate to all subscribed components
- Hook handles loading states correctly during initialization
- Provider component properly wraps child components and provides context
- Cleanup of listeners when components unmount (no memory leaks)
