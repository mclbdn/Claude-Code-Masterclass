# Implementation Plan: Create Heist Form

## Context

The `/heists/create` page currently exists as an empty stub. This feature will implement a fully functional form that allows authenticated users to create new heist missions. Users will be able to enter a title and description, assign the heist to another user (selected from a dropdown populated from the Firestore `users` collection), and submit to create a new heist document in Firestore. Upon successful creation, users will be redirected to the `/heists` listing page.

This implements the spec at `_specs/create-heist-form.md` with clarifications:
- Current user excluded from assignee dropdown
- No confirmation dialog before creating
- Auto-generate codenames if missing from user documents
- Immediate redirect on success (no success toast)

## Implementation Approach

### 1. Create Firestore Utilities (`/lib/firebase/firestore.ts`)

Create a new file to centralize Firestore query and write operations. This follows the pattern of keeping Firebase-specific code in `/lib/firebase/` (alongside `firebase.ts`, `config.ts`, `heistConverter.ts`).

**Functions to create:**

- `fetchUsers()`: Query the `users` collection and return all user documents with their ID and codename. Auto-generate codenames using `generateCodename()` if a user document is missing one.

- `createHeistDocument(heistData: CreateHeistInput)`: Write a new heist document to the `heists` collection using `addDoc()`. Return the document ID.

**Type to export:**
```typescript
export interface UserDocument {
  id: string
  codename: string
}
```

Update `/lib/firebase/index.ts` to export these utilities.

### 2. Update Type Definitions (`/types/firestore/index.ts`)

Add `USERS` to the `COLLECTIONS` constant:
```typescript
export const COLLECTIONS = {
  HEISTS: "heists",
  USERS: "users",
} as const
```

### 3. Create Form Component (`/components/CreateHeistForm/`)

Following the established pattern from `LoginForm` and `SignupForm`:

**Directory structure:**
```
CreateHeistForm/
  ├── CreateHeistForm.tsx
  ├── CreateHeistForm.module.css
  └── index.ts
```

**Component architecture (`CreateHeistForm.tsx`):**

- Use `"use client"` directive
- Import `useUser()` hook to access current authenticated user
- Import `useRouter()` from `next/navigation` for redirect
- Import `createHeist` utility from `@/lib/utils/createHeist`
- Import Firestore utilities (`fetchUsers`, `createHeistDocument`)

**State management:**
```typescript
const [formData, setFormData] = useState<HeistFormData>({
  title: "",
  description: "",
  assignedTo: "",
})
const [users, setUsers] = useState<UserDocument[]>([])
const [errors, setErrors] = useState<FormErrors>({})
const [isLoading, setIsLoading] = useState(false)
const [isFetchingUsers, setIsFetchingUsers] = useState(true)
const [firebaseError, setFirebaseError] = useState<string>("")
```

**Form fields:**
1. **Title** (text input, required)
2. **Description** (textarea, required, 4 rows)
3. **Assign To** (select dropdown, required) - populated with users, filtered to exclude current user

**Key behaviors:**

- **On mount:** Fetch users from Firestore using `fetchUsers()`, filter out current user (`user?.uid`), set `isFetchingUsers` to false when done
- **Validation:** Check all three fields are filled before submission
- **On submit:**
  1. Clear previous errors
  2. Run validation
  3. Check user is authenticated
  4. Find assignee's codename from users array
  5. Call `createHeist()` utility with form data and user info
  6. Call `createHeistDocument()` to write to Firestore
  7. Redirect to `/heists` using `router.push()`
  8. On error: map Firestore error codes to friendly messages, preserve form data

**Error handling:**
- Map common Firestore error codes: `permission-denied`, `unavailable`
- Display Firebase errors at top of form
- Display validation errors below each field
- Set `isLoading` to false on error to allow retry

**Empty users edge case:**
If `users.length === 0` after fetching, display a message explaining no users are available and the form cannot be submitted.

**CSS Module (`CreateHeistForm.module.css`):**

Follow the pattern from `LoginForm.module.css`:
- `@reference "../../app/globals.css"` at the top
- Use `@apply` directive for all Tailwind classes
- Classes needed: `.form`, `.inputGroup`, `.label`, `.input`, `.textarea`, `.select`, `.inputError`, `.error`, `.submitButton`, `.firebaseError`, `.emptyState`
- Button uses `background-color: var(--color-primary)`

**Accessibility:**
- `aria-invalid` on inputs with errors
- `aria-describedby` linking inputs to error IDs
- `role="alert"` on error messages
- `noValidate` on form element
- Proper `htmlFor` on labels

**Index file (`index.ts`):**
```typescript
export { default } from "./CreateHeistForm"
```

### 4. Update Create Page (`/app/(dashboard)/heists/create/page.tsx`)

Import and render the `CreateHeistForm` component:

```typescript
import CreateHeistForm from "@/components/CreateHeistForm"

export default function CreateHeistPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Create a New Heist</h2>
        <CreateHeistForm />
      </div>
    </div>
  )
}
```

### 5. Create Tests (`/tests/components/CreateHeistForm.test.tsx`)

Follow the TDD pattern from existing form tests. Use Vitest + React Testing Library.

**Mock setup:**
- Mock `next/navigation` router with `push` function
- Mock `useUser` hook to return test user
- Mock Firestore utilities (`fetchUsers`, `createHeistDocument`)
- Mock `createHeist` utility

**Test cases:**

1. **Rendering:** All form fields render correctly
2. **User loading:**
   - Shows loading state while fetching users
   - Populates dropdown with user codenames
   - Filters out current logged-in user
3. **Validation:**
   - Shows errors for empty title, description, assignedTo
   - Prevents submission with validation errors
4. **Submission:**
   - Calls `createHeist()` with correct parameters
   - Calls `createHeistDocument()` with result
   - Redirects to `/heists` on success
   - Shows loading state during submission
5. **Error handling:**
   - Shows error when user fetch fails
   - Shows error when Firestore write fails
   - Preserves form data on error
6. **Accessibility:**
   - `aria-invalid` set correctly
   - Error messages properly associated
7. **Edge cases:**
   - Empty users collection shows appropriate message
   - Submit disabled when no users available

## Critical Files

**Files to create:**
- `/lib/firebase/firestore.ts` - Firestore query/write utilities
- `/components/CreateHeistForm/CreateHeistForm.tsx` - Main form component
- `/components/CreateHeistForm/CreateHeistForm.module.css` - Component styles
- `/components/CreateHeistForm/index.ts` - Export file
- `/tests/components/CreateHeistForm.test.tsx` - Component tests

**Files to modify:**
- `/app/(dashboard)/heists/create/page.tsx` - Import and render form
- `/types/firestore/index.ts` - Add USERS collection constant
- `/lib/firebase/index.ts` - Export new Firestore utilities

## Reusable Code

**Utilities to use:**
- `createHeist()` from `/lib/utils/createHeist.ts` - Constructs `CreateHeistInput` with timestamps and deadline
- `generateCodename()` from `/lib/utils/generateCodename.ts` - Auto-generates codenames for users missing them
- `useUser()` from `/hooks/useUser/useUser.ts` - Access current authenticated user
- `heistConverter` from `/lib/firebase/heistConverter.ts` - Could be used with `addDoc()` if typed collection reference is preferred (optional)

**Patterns to follow:**
- Form structure: Copy from `SignupForm.tsx` (lines 13-200)
- CSS module: Copy pattern from `LoginForm.module.css` (lines 1-79)
- Error handling: Error code mapping pattern from `SignupForm.tsx` (lines 95-114)
- Validation: Validation function pattern from `SignupForm.tsx` (lines 28-44)
- Accessibility: aria attributes from `LoginForm.tsx`

## Verification

**Manual testing:**
1. Run `npm run dev`
2. Sign in to the app
3. Navigate to `/heists/create`
4. Verify form loads and dropdown populates with users (excluding current user)
5. Try submitting empty form - validation errors should appear
6. Fill form completely and submit
7. Verify redirect to `/heists` occurs
8. Check Firestore console to confirm heist document was created

**Automated testing:**
1. Run `npm test -- CreateHeistForm.test.tsx`
2. All tests should pass
3. Verify coverage of: rendering, validation, submission, error handling, accessibility

**Edge case testing:**
1. Test with no other users in database - form should show "no users available" message
2. Test with network disconnected - should show network error
3. Test navigation during submission - React cleanup should handle gracefully

## Implementation Order

1. Create `/lib/firebase/firestore.ts` with `fetchUsers()` and `createHeistDocument()`
2. Update `/types/firestore/index.ts` and `/lib/firebase/index.ts` exports
3. Create `/components/CreateHeistForm/CreateHeistForm.tsx` with full logic
4. Create `/components/CreateHeistForm/CreateHeistForm.module.css` with styles
5. Create `/components/CreateHeistForm/index.ts` export
6. Update `/app/(dashboard)/heists/create/page.tsx` to use component
7. Create `/tests/components/CreateHeistForm.test.tsx` with comprehensive tests
8. Run tests and verify all pass
9. Manual testing to verify end-to-end functionality
