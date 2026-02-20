# Spec for Logout Button in Navbar

branch: claude/feature/logout-button-navbar
figma_component (if used): Navbar - Logout Button

## Summary

Add a logout button to the Navbar component that allows authenticated users to sign out of the application. The button should only be visible when a user is logged in (when `useUser` hook returns a user object). Clicking the button calls Firebase's `signOut` method to log the user out. The existing `AuthContext` will automatically detect the auth state change and update the UI accordingly.

## Functional Requirements

- Add a logout button to the Navbar component
- Button should only render when a user is logged in (check `useUser` hook)
- Clicking the button should call Firebase Auth's `signOut` method
- No redirect logic needed (handled by existing auth guards in future work)
- Button should be styled consistently with existing Navbar elements
- Button should have appropriate hover and active states
- Use the `auth` singleton from `@/lib/firebase`
- The `AuthContext` will automatically update when signOut completes

## Figma Design Reference

- File: Page Designs
- Component: Navbar - Logout Button
- Link: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=57-18&m=dev
- Key visual constraints:
  - Positioned in the Navbar alongside existing navigation elements
  - Matches existing button/link styling patterns
  - Clear visual distinction as a logout action

## Possible Edge Cases

- User clicks logout button multiple times rapidly
- Network error during logout (signOut fails)
- User clicks logout while other async operations are in progress
- Button appears/disappears during auth state transitions
- Logout happens on one tab while app is open in another tab

## Acceptance Criteria

- Logout button renders in the Navbar component
- Button only visible when `user` is not null (from `useUser` hook)
- Button does not render when user is logged out
- Clicking the button calls `signOut(auth)` from Firebase Auth
- The `useUser` hook automatically updates to reflect logged-out state after signOut completes
- Button has appropriate ARIA labels for accessibility
- Button styling matches Navbar design patterns
- No console errors when logging out
- Component remains a client component (uses `useUser` hook)

## Open Questions

- Should the button show a loading state while signing out?
- Should we show a confirmation dialog before logging out?
- What icon should be used for the logout button (text only, icon only, or both)?
- Where exactly in the Navbar should the button be positioned?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Logout button renders when user is logged in
- Logout button does not render when user is logged out
- Clicking logout button calls signOut function
- Button has correct accessibility attributes
- Button styling matches expected CSS classes
