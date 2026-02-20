# Implementation Plan: Logout Button in Navbar

## Context

The Navbar component currently has no logout functionality. Users who are logged in need a way to sign out of the application. This feature adds a logout button to the Navbar that calls Firebase's `signOut` method when clicked. The button should only be visible when a user is authenticated (detected via the existing `useUser` hook).

The existing `AuthContext` will automatically detect the auth state change when signOut completes and update the UI accordingly through its `onAuthStateChanged` listener, so no manual state updates or redirects are needed in this component.

## Implementation Approach

### 1. Convert Navbar to Client Component

**File: `components/Navbar/Navbar.tsx`** (modify)

The Navbar is currently a server component. To use hooks and event handlers, we need to:
- Add `"use client"` directive at the top
- Import `useState` from React
- Import `useUser` hook from `@/hooks/useUser`
- Import `signOut` from `firebase/auth`
- Import `auth` from `@/lib/firebase`

### 2. Add Logout Logic

**Add state for loading:**
```typescript
const [isLoggingOut, setIsLoggingOut] = useState(false)
const { user, loading } = useUser()
```

**Create logout handler:**
```typescript
const handleLogout = async () => {
  setIsLoggingOut(true)
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Logout failed:', error)
    setIsLoggingOut(false)
  }
}
```

**Why loading state:**
- Prevents double-clicks during logout
- Provides visual feedback (button text changes to "Logging out...")
- Better UX for the 200-500ms Firebase operation takes

### 3. Update Navbar JSX

**Position the logout button:**
- Add logout button as a second `<li>` in the existing `<ul>`
- Use flexbox to position Create Heist on left, Logout on right
- Only render logout button when `user` exists (not during loading, not when logged out)

**Button structure:**
```typescript
{user && (
  <li>
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="btn"
    >
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </button>
  </li>
)}
```

**Button styling:**
- Reuse existing global `.btn` class (matches Create Heist button)
- Button text: "Log Out" (simple, clear, no icon needed)

### 4. Update Navbar Styles

**File: `components/Navbar/Navbar.module.css`** (modify)

Add flexbox layout to the `<ul>`:
```css
.navList {
  @apply flex justify-between items-center w-full;
}
```

Apply this class to the `<ul>` element.

**File: `app/globals.css`** (modify if needed)

Add disabled button styles if not present:
```css
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

### 5. Update Navbar Tests

**File: `tests/components/Navbar/Navbar.test.tsx`** (modify)

No need for mocks

**Update imports:**
- Import `useUser` from the mock
- Import test utilities: `waitFor`, `fireEvent` (if not already imported)

**Add new test cases:**
1. Logout button hidden when user is logged out
2. Logout button visible when user is logged in
3. Logout button hidden during auth loading state
4. Clicking logout button calls signOut function
5. Button shows loading state during logout (disabled + text change)

## Critical Files to Modify

**Modified files:**
- `components/Navbar/Navbar.tsx` - Convert to client component, add logout button and handler
- `components/Navbar/Navbar.module.css` - Add flexbox layout class for button positioning
- `tests/components/Navbar/Navbar.test.tsx` - Add mocks and test cases
- `app/globals.css` - Add disabled button styles (if not already present)

## Existing Patterns to Reuse

- **useUser hook**: Import from `@/hooks/useUser` (already implemented)
- **Firebase auth**: Import `auth` from `@/lib/firebase` (already initialized)
- **Button styling**: Use global `.btn` class (matches existing Create Heist button)
- **Test mocking**: Follow pattern from `tests/hooks/useUser.test.tsx` and `tests/context/AuthContext.test.tsx`
- **Loading state pattern**: Similar to SignupForm's `isLoading` state

## Implementation Sequence

1. Add `btn:disabled` styles to `app/globals.css` (if not present)
2. Update `components/Navbar/Navbar.tsx`:
   - Add "use client" directive
   - Add imports and state
   - Create handleLogout function
   - Update JSX to include logout button
3. Update `components/Navbar/Navbar.module.css` with flexbox layout
4. Update `tests/components/Navbar/Navbar.test.tsx` with mocks and tests
5. Run tests: `npm test -- tests/components/Navbar`
6. Manual testing in browser

## Verification Steps

After implementation:

1. **Run tests**: `npm test -- tests/components/Navbar` - all tests should pass
2. **Type checking**: `npx tsc --noEmit` - no TypeScript errors
3. **Manual testing**:
   - Log in to the app
   - Navigate to `/heists` page (dashboard with Navbar)
   - Verify logout button appears on the right side of the navigation
   - Click logout button
   - Verify button shows "Logging out..." and is disabled
   - Verify user is logged out (useUser hook updates, auth state changes)
   - Verify logout button disappears after logout completes
   - Verify no console errors during logout
4. **Visual check**: Logout button styling matches Create Heist button

The logout functionality will be complete and the existing auth guards and redirects (implemented in other features) will handle the post-logout behavior automatically.
