# Implementation Plan: Route Protection with Auth Guards

## Context

Currently, the app has no route protection - unauthenticated users can access dashboard pages (`/heists`, `/heists/create`, `/heists/[id]`) and authenticated users can access public pages (`/login`, `/signup`, `/`). This creates a poor user experience and potential security concerns.

The `useUser` hook (returns `{ user, loading }`) and `AuthProvider` already exist and wrap the entire app at the root layout level. Firebase's `onAuthStateChanged` listener manages auth state, with `loading` starting as `true` and becoming `false` once Firebase resolves the auth status.

This implementation will add auth guards to both route group layouts to automatically redirect users based on their authentication status, with a loading state to prevent flashing of unauthorized content.

## Implementation Approach

We'll modify both layouts directly (converting them to client components) rather than creating separate auth guard wrapper components. This keeps the logic simple, co-located, and avoids unnecessary abstraction.

**Pattern**: Show loading spinner → Check auth → Redirect if needed → Render content

## Files to Create/Modify

### 1. Create AuthLoadingSpinner Component

**New files**:
- `components/AuthLoadingSpinner/AuthLoadingSpinner.tsx`
- `components/AuthLoadingSpinner/AuthLoadingSpinner.module.css`
- `components/AuthLoadingSpinner/index.ts`

**Purpose**: Reusable loading spinner with Clock8 icon (matching app branding) displayed during auth checks and redirects.

**Implementation**:
- Use `Clock8` icon from `lucide-react`
- Apply spinning animation via CSS
- Center the spinner with "Loading..." text
- Use Tailwind's `@apply` in CSS Module for styling

### 2. Update Public Layout (`app/(public)/layout.tsx`)

**Changes**:
- Convert to client component (add `"use client"` directive)
- Import `useUser`, `useRouter`, and `AuthLoadingSpinner`
- Add `useEffect` to redirect authenticated users to `/heists`
- Return loading spinner when `loading === true`
- Return loading spinner when `user !== null` (during redirect)
- Only render children when `loading === false && user === null`

**Logic flow**:
```
if (loading) → show spinner
if (user exists) → show spinner + trigger redirect
else → render children (login/signup forms)
```

This prevents flashing login forms to already-authenticated users.

### 3. Update Dashboard Layout (`app/(dashboard)/layout.tsx`)

**Changes**:
- Convert to client component (add `"use client"` directive)
- Import `useUser`, `useRouter`, and `AuthLoadingSpinner`
- Add `useEffect` to redirect unauthenticated users to `/login`
- Return loading spinner when `loading === true`
- Return loading spinner when `user === null` (during redirect)
- Only render Navbar + children when `loading === false && user !== null`

**Logic flow**:
```
if (loading) → show spinner
if (user is null) → show spinner + trigger redirect
else → render Navbar + children (heist pages)
```

This prevents flashing protected content to unauthenticated users.

### 4. Create Test Files

**New files**:
- `tests/components/AuthLoadingSpinner.test.tsx`
- `tests/layouts/PublicLayout.test.tsx`
- `tests/layouts/DashboardLayout.test.tsx`

**Test coverage**:
- **AuthLoadingSpinner**: Renders loading text and clock icon
- **PublicLayout**:
  - Shows spinner during auth loading
  - Renders children for unauthenticated users
  - Redirects authenticated users to `/heists`
  - Shows spinner during redirect (prevents flash)
  - No premature redirects during initial loading
- **DashboardLayout**:
  - Shows spinner during auth loading
  - Renders Navbar + children for authenticated users
  - Redirects unauthenticated users to `/login`
  - Shows spinner during redirect (prevents flash)
  - No premature redirects during initial loading

**Mocking strategy**:
- Mock `useUser` to control auth state
- Mock `useRouter` to verify redirect calls
- Mock `Navbar` in dashboard tests to isolate layout logic

## Implementation Steps (TDD Approach)

1. **Create AuthLoadingSpinner component**
   - Write tests first (`AuthLoadingSpinner.test.tsx`)
   - Implement component (`.tsx`, `.module.css`, `index.ts`)
   - Run tests to verify

2. **Update Public Layout**
   - Write tests first (`PublicLayout.test.tsx`)
   - Convert layout to client component
   - Add auth guard logic
   - Run tests to verify

3. **Update Dashboard Layout**
   - Write tests first (`DashboardLayout.test.tsx`)
   - Convert layout to client component
   - Add auth guard logic
   - Run tests to verify

4. **Manual verification**
   - Visit `/login` while logged in → should redirect to `/heists`
   - Visit `/heists` while logged out → should redirect to `/login`
   - Log in on one tab, check redirect on another tab
   - Log out and verify redirect to `/login`
   - Check for console errors during redirects

## Critical Files

- `/Users/michalbednar/DEV/Claude-Code-Masterclass/components/AuthLoadingSpinner/AuthLoadingSpinner.tsx` - New loading component
- `/Users/michalbednar/DEV/Claude-Code-Masterclass/app/(public)/layout.tsx` - Add auth guard to public routes
- `/Users/michalbednar/DEV/Claude-Code-Masterclass/app/(dashboard)/layout.tsx` - Add auth guard to dashboard routes
- `/Users/michalbednar/DEV/Claude-Code-Masterclass/tests/layouts/PublicLayout.test.tsx` - Test public layout auth behavior
- `/Users/michalbednar/DEV/Claude-Code-Masterclass/tests/layouts/DashboardLayout.test.tsx` - Test dashboard layout auth behavior
- `/Users/michalbednar/DEV/Claude-Code-Masterclass/tests/components/AuthLoadingSpinner.test.tsx` - Test loading component

## Reusable Code Identified

- `useUser` hook at `hooks/useUser/useUser.ts` - Already returns `{ user, loading }`
- `AuthProvider` at `context/AuthContext/AuthContext.tsx` - Already wraps entire app
- `Navbar` component at `components/Navbar/Navbar.tsx` - Already uses `useUser`
- Layout prop pattern: `Readonly<{ children: React.ReactNode }>`

## Edge Cases Handled

- **Multiple tabs**: Firebase's `onAuthStateChanged` syncs across tabs automatically
- **Rapid auth changes**: `useEffect` dependencies ensure proper re-triggering
- **Slow network**: Loading spinner displays until auth resolves
- **Manual navigation**: Guards activate on every render
- **Race conditions**: Early returns prevent rendering content during transitions

## Verification

After implementation, verify:

1. **Run tests**: `npm test` - all tests should pass
2. **Manual testing**:
   - Start dev server: `npm run dev`
   - Test public → dashboard redirect:
     - Log in at `/login`
     - Try navigating to `/login` → should redirect to `/heists`
   - Test dashboard → public redirect:
     - Log out from Navbar
     - Try navigating to `/heists` → should redirect to `/login`
   - Test multi-tab sync:
     - Open app in two tabs
     - Log in on one tab
     - Check that other tab redirects automatically
3. **Check console**: No errors during redirects or auth state changes
4. **Visual check**: Loading spinner appears briefly, no flash of protected content
