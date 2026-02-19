# Implementation Plan: Global Auth State Management

## Context

This feature implements a global authentication state management system using React Context and Firebase Auth. Currently, the app has Firebase initialized (`lib/firebase/firebase.ts` exports an `auth` object), but no state management exists to track the current user across components. This leads to potential prop drilling and makes it difficult for components to access authentication state.

The goal is to create a `useUser` hook that any component can import and use to access the current authenticated user (or `null` if logged out). A realtime Firebase listener will keep this state synchronized across all components automatically.

This is foundational infrastructure that will enable auth-aware features like protected routes, user-specific data queries, and personalized UI elements.

## Implementation Approach

### 1. Create Type Definitions

**File: `types/user.ts`** (new)

Define TypeScript interfaces for `User` and `AuthState`:

- `User`: `{ uid: string, email: string, displayName: string | null }`
- `AuthState`: `{ user: User | null, loading: boolean }`

### 2. Build AuthContext Provider

**File: `context/AuthContext/AuthContext.tsx`** (new)

Create a client component that:

- Imports `onAuthStateChanged` from `firebase/auth` and `auth` from `@/lib/firebase`
- Uses `useState` to manage `{ user, loading }` state
- Sets initial `loading: true`, switches to `false` after first auth check
- Registers Firebase listener in `useEffect` that updates state when auth changes
- Returns cleanup function to unsubscribe and prevent memory leaks
- Provides state via React Context

**File: `context/AuthContext/index.ts`** (new)

- Re-export `AuthContext` and `AuthProvider`

**Pattern to follow:** `"use client"` directive, CSS Modules pattern with index.ts re-exports

### 3. Create useUser Hook

**File: `hooks/useUser/useUser.ts`** (new)

Simple hook that:

- Calls `useContext(AuthContext)`
- Throws error if used outside `AuthProvider` (developer guard)
- Returns `{ user, loading }` with full TypeScript types

**File: `hooks/useUser/index.ts`** (new)

- Re-export `useUser`

### 4. Integrate Provider into Root Layout

**File: `app/layout.tsx`** (modify)

Wrap `{children}` with `<AuthProvider>`:

```tsx
<body className="h-full">
  <AuthProvider>{children}</AuthProvider>
</body>
```

The root layout remains a server component. `AuthProvider` is the client component that provides context to all descendants.

### 5. Update Components to Use useUser

#### 5.1 Splash Page - Add Redirect Logic

**File: `app/(public)/page.tsx`** (modify)

Convert to client component and add redirect logic:

- Import `useUser` and `useRouter`
- In `useEffect`, check `loading` first (return early if true)
- If `user` exists, redirect to `/heists`
- If `user` is null, redirect to `/login`
- Keep existing splash screen visible during redirect (no loading spinner needed)

**Note:** This matches the existing comment in the file about redirect behavior.

#### 5.2 Dashboard Layout - Add Auth Guard

**File: `app/(dashboard)/layout.tsx`** (modify)

Convert to client component and add auth protection:

- Import `useUser` and `useRouter`
- In `useEffect`, redirect to `/login` if no user (after loading completes)
- Render loading UI while `loading: true`
- Return `null` if no user (redirect in progress)

This protects all dashboard routes (`/heists`, `/heists/create`, `/heists/[id]`) without modifying each page.

### 6. Write Tests

#### 6.1 AuthContext Tests

**File: `tests/context/AuthContext.test.tsx`** (new)

Mock `firebase/auth` and `@/lib/firebase` modules. Test:

- Initial loading state is `true`
- User state updates when `onAuthStateChanged` fires with user
- User state clears when `onAuthStateChanged` fires with `null`
- Unsubscribe function is called on unmount
- Multiple components receive the same state

#### 6.2 useUser Hook Tests

**File: `tests/hooks/useUser.test.tsx`** (new)

Test:

- Throws error when used outside `AuthProvider`
- Returns `{ user, loading }` when used inside `AuthProvider`
- Hook updates when auth state changes

**Pattern to follow:** Existing test structure in `tests/` directory using Vitest + React Testing Library

## Critical Files to Modify

New files:

- `types/user.ts` - Type definitions
- `context/AuthContext/AuthContext.tsx` - Provider implementation
- `context/AuthContext/index.ts` - Re-export
- `hooks/useUser/useUser.ts` - Hook implementation
- `hooks/useUser/index.ts` - Re-export
- `tests/context/AuthContext.test.tsx` - Context tests
- `tests/hooks/useUser.test.tsx` - Hook tests

Modified files:

- `app/layout.tsx` - Add AuthProvider wrapper
- `app/(public)/page.tsx` - Add redirect logic
- `app/(dashboard)/layout.tsx` - Add auth guard

## Existing Patterns to Reuse

- **Firebase Auth**: Import from `@/lib/firebase` (already initialized)
- **Component Structure**: Directory per component with index.ts re-export
- **Client Components**: Use `"use client"` directive at top of file
- **TypeScript**: Strict typing, no `any` types
- **Path Alias**: Use `@/` for all imports
- **CSS Modules**: `.module.css` files for component styles
- **Testing**: Vitest with `@testing-library/react`, describe blocks

## Out of Scope

Per the spec, this plan does NOT include:

- Login/logout/signup flow implementation (those forms already exist with console.log stubs)
- Server-side session validation
- Optimistic updates
- Additional auth methods (refresh token, permissions)
- Do not use the hook anywhere in the application yet

The existing `LoginForm` and `SignupForm` components will continue to work independently. When they call Firebase auth methods (in future work), the `AuthContext` will automatically detect the state change.

## Verification Steps

After implementation:

1. **Run tests**: `npm test` - all new tests should pass
2. **Manual testing**:
   - Visit `/` - should redirect to `/login` (not logged in)
   - Open browser console - verify no errors or warnings
3. **Type checking**: `npx tsc --noEmit` - no TypeScript errors
4. **Dev server**: `npm run dev` - no console errors or warnings

The auth state infrastructure will be ready for the login/logout flows to be implemented in a future feature.

