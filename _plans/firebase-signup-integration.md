# Implementation Plan: Firebase Signup Integration with Random Codenames

## Context

The SignupForm component currently has a console.log stub where Firebase integration should happen. This feature connects the signup form to Firebase Auth to create real user accounts. Each user receives a randomly generated codename (displayName) in PascalCase format composed of three words (e.g., "SilentMoonWarrior"). A corresponding Firestore document stores minimal user data for app features.

The existing auth infrastructure (`useUser` hook and `AuthContext`) will automatically detect new users via the `onAuthStateChanged` listener, so no manual state updates are needed after signup completes.

## Implementation Approach

### 1. Create Codename Generator Utility

**File: `lib/utils/generateCodename.ts`** (new)

Create a pure function that:
- Defines three word arrays (adjectives, nouns, roles) with ~15-20 words each
- Randomly selects one word from each array
- Concatenates them in PascalCase format
- Returns the generated codename string

**File: `lib/utils/index.ts`** (new)
- Re-export `generateCodename` for clean imports

**Example output**: "SilentMoonWarrior", "RapidPhoenixHunter", "GoldenDragonSage"

### 2. Update SignupForm Component

**File: `components/SignupForm/SignupForm.tsx`** (modify)

**Add new state:**
```typescript
const [isLoading, setIsLoading] = useState(false)
const [firebaseError, setFirebaseError] = useState<string>("")
const [successMessage, setSuccessMessage] = useState<string>("")
```

**Add imports:**
- `useRouter` from `next/navigation` (for redirect)
- `createUserWithEmailAndPassword`, `updateProfile` from `firebase/auth`
- `doc`, `setDoc` from `firebase/firestore`
- `auth`, `db` from `@/lib/firebase`
- `generateCodename` from `@/lib/utils`

**Replace console.log stub with async multi-step flow:**
1. Validate form (existing logic)
2. Set loading state
3. Create auth account with `createUserWithEmailAndPassword(auth, email, password)`
4. Generate random codename
5. Update user profile with `updateProfile(user, { displayName: codename })`
6. Create Firestore document: `setDoc(doc(db, "users", user.uid), { codename, id: user.uid })`
7. Show success message
8. Redirect to `/heists` after 500ms delay

**Error handling:**
- Map Firebase error codes to friendly messages:
  - `auth/email-already-in-use` → "This email is already registered. Try logging in instead."
  - `auth/weak-password` → "Password is too weak. Please use a stronger password."
  - `auth/invalid-email` → "Invalid email format."
  - `auth/network-request-failed` → "Network error. Please check your connection."
  - Default → "An unexpected error occurred. Please try again."
- Display errors in `firebaseError` state
- Re-enable form on error (set `isLoading = false`)

**UI updates:**
- Disable form inputs and button when `isLoading` is true
- Change button text to "Creating account..." during loading
- Display `firebaseError` in a styled error container
- Display `successMessage` in a styled success container

### 3. Update SignupForm Styles

**File: `components/SignupForm/SignupForm.module.css`** (modify)

Add CSS classes for error and success feedback:
```css
.firebaseError {
  @apply text-red-600 text-sm mb-4 p-3 bg-red-50 rounded;
}

.successMessage {
  @apply text-green-600 text-sm mb-4 p-3 bg-green-50 rounded;
}
```

### 4. Write Tests

**File: `tests/lib/utils/generateCodename.test.ts`** (new)

Test:
- Codename has PascalCase format (no spaces, starts with uppercase)
- Multiple calls produce unique values (test randomness)
- Codename structure follows three-word pattern

**File: `tests/components/SignupForm.test.tsx`** (modify)


Update existing test that checks console.log to instead verify Firebase integration:
- Verify `createUserWithEmailAndPassword` called with correct email/password
- Verify `updateProfile` called with generated codename
- Verify `setDoc` called with structure: `{ codename: "SilentMoonWarrior", id: user.uid }`
- Verify redirect to `/heists`

Add new test cases:
- Email already in use error displays correct message
- Weak password error displays correct message
- Network error displays correct message
- Loading state disables form during submission
- Success message displays before redirect

## Critical Files to Modify

**New files:**
- `lib/utils/generateCodename.ts` - Codename generation logic with three word arrays
- `lib/utils/index.ts` - Re-export utility functions
- `tests/lib/utils/generateCodename.test.ts` - Unit tests for codename generator

**Modified files:**
- `components/SignupForm/SignupForm.tsx` - Replace console.log with multi-step Firebase signup flow
- `components/SignupForm/SignupForm.module.css` - Add error/success message styles

no need for mocks

## Existing Patterns to Reuse

- **Firebase singletons**: Import `auth` and `db` from `@/lib/firebase` (already initialized)
- **Component structure**: Client component with `"use client"` directive
- **State management**: `useState` for form state (existing pattern in LoginForm/SignupForm)
- **Path alias**: Use `@/` for all imports
- **CSS Modules**: Tailwind `@apply` directive for styles
- **Auto state update**: `AuthContext` listens to `onAuthStateChanged` - no manual updates needed

## Implementation Sequence

1. Create codename generator utility with tests (TDD approach)
2. Update SignupForm TypeScript (add state, imports, async logic)
3. Update SignupForm UI (loading states, error/success displays)
4. Update SignupForm CSS (error/success message styles)
6. Run tests to verify all cases pass
7. Manual testing in dev environment

## Edge Cases Handled

- **Email already exists**: Display friendly error, user can retry
- **Weak password**: Display Firebase error message
- **Network failure**: Display network error, allow retry
- **Firestore write fails**: Auth account still created (acceptable - no rollback needed)
- **Profile update fails**: Auth account created with `displayName: null` (AuthContext supports this)
- **Duplicate codenames**: Acceptable per spec (no uniqueness check)
- **Partial failures**: User can continue using app, future enhancement can repair missing data

## Verification Steps

After implementation:

1. **Run tests**: `npm test` - all tests should pass including new Firebase integration tests
2. **Type checking**: `npx tsc --noEmit` - no TypeScript errors
3. **Manual testing**:
   - Fill out signup form with valid email/password
   - Click "Sign Up" button
   - Verify loading state appears ("Creating account..." text)
   - Verify success message displays
   - Verify redirect to `/heists` page
   - Check Firebase Console - verify user created with displayName set
   - Check Firestore Console - verify document in `users/{uid}` with `{ codename, id }`
   - Verify `useUser` hook reflects the new user (check in Navbar or console)
4. **Error testing**:
   - Try signing up with same email again - verify "email already in use" error
   - Try weak password (e.g., "12345") - verify weak password error
   - Disable network - verify network error message
5. **Dev server**: No console errors or warnings during signup flow

The signup form will create real Firebase Auth accounts and Firestore user documents, with the auth state automatically synchronized via the existing `AuthContext`.
