# Spec for Route Protection with Auth Guards

branch: claude/feature/route-protection-auth-guards

## Summary

Implement route protection using the existing `useUser` hook to ensure that public pages are only accessible to unauthenticated users, and dashboard pages are only accessible to authenticated users. Add auth guards to both route group layouts that redirect users based on their authentication status. Display a simple loading state while the auth status is being determined by Firebase's `onAuthStateChanged` listener.

## Functional Requirements

- Protect routes in the `(public)` group - redirect authenticated users to `/heists`
- Protect routes in the `(dashboard)` group - redirect unauthenticated users to `/login`
- Use the existing `useUser` hook to check authentication status
- Show a loading indicator while `loading` is `true` (auth status being determined)
- Convert both layout components to client components (need hooks)
- Use `useRouter` from `next/navigation` for redirects
- Use `useEffect` to handle redirects (don't redirect during initial loading state)
- Prevent flash of protected content before redirect
- The loading state should be simple and minimal (e.g., centered "Loading..." text or skeleton)

## Functional Requirements Detail

### Public Layout (`app/(public)/layout.tsx`):
- Check if user is authenticated
- While loading, show loading indicator
- If user exists, redirect to `/heists`
- If user is null (not loading), render children

### Dashboard Layout (`app/(dashboard)/layout.tsx`):
- Check if user is authenticated
- While loading, show loading indicator
- If user is null (not loading), redirect to `/login`
- If user exists, render Navbar and children

## Possible Edge Cases

- User logs in on one tab, opens app in another tab (should auto-redirect via listener)
- User logs out on one tab while viewing dashboard in another (should redirect)
- Rapid auth state changes during login/logout
- User manually navigates to protected route while logged out
- User manually navigates to public route while logged in
- Slow network - loading state persists longer
- User navigates away during redirect
- Race conditions between auth state update and redirect

## Acceptance Criteria

- Public routes (`/login`, `/signup`, `/`) redirect authenticated users to `/heists`
- Dashboard routes (`/heists`, `/heists/create`, `/heists/[id]`) redirect unauthenticated users to `/login`
- Loading state displays while auth status is being determined (`loading === true`)
- No flash of protected content before redirect
- Redirects happen automatically via `useEffect` when auth state changes
- Both layouts are converted to client components with `"use client"` directive
- TypeScript types are properly maintained
- No console errors during redirects
- Auth state changes trigger automatic redirects without page refresh

## Open Questions

- What should the loading indicator look like? (simple "Loading..." text or skeleton) spinner using the clock icon from the title
- Should we show the loading state for the entire page or just the protected content area? entire page
- Should the loading state have any styling or just plain text? up to you
- Should we debounce rapid auth state changes? no

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Public layout redirects authenticated users
- Public layout shows loading state during auth check
- Public layout renders children for unauthenticated users
- Dashboard layout redirects unauthenticated users
- Dashboard layout shows loading state during auth check
- Dashboard layout renders Navbar and children for authenticated users
- Loading state disappears after auth status is determined
