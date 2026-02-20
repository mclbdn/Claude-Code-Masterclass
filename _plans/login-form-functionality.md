# Implementation Plan: Login Form Functionality

## Context

The LoginForm component currently has a console.log stub where Firebase authentication should happen. This feature connects the login form to Firebase Auth to authenticate existing users with their email and password. The implementation will closely mirror the SignupForm (which was recently implemented with Firebase auth), but use `signInWithEmailAndPassword` instead of `createUserWithEmailAndPassword`.

The existing `AuthContext` will automatically detect the auth state change when login succeeds via the `onAuthStateChanged` listener, so no manual state updates are needed.

## Implementation Approach

This implementation follows the exact same pattern as the SignupForm we just completed, with minor differences for login-specific behavior.

### 1. Update LoginForm Component

**File: `components/LoginForm/LoginForm.tsx`** (modify)

**Add new imports:**
```typescript
import { useState } from "react" // already present
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
```

**Add new state:**
```typescript
const router = useRouter()
const [isLoading, setIsLoading] = useState(false)
const [firebaseError, setFirebaseError] = useState<string>("")
const [successMessage, setSuccessMessage] = useState<string>("")
```

**Replace console.log stub with async Firebase login:**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  // Clear previous errors and messages
  setErrors({})
  setFirebaseError("")
  setSuccessMessage("")

  // Client-side validation (existing logic)
  const newErrors = validate()
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  setIsLoading(true)

  try {
    // Sign in with Firebase Auth
    await signInWithEmailAndPassword(auth, email, password)

    // Show success message
    setSuccessMessage("Login successful!")

    // No redirect per spec - just show success
  } catch (error: any) {
    setIsLoading(false)

    // Map Firebase error codes to user-friendly messages
    const errorCode = error?.code || ""

    if (errorCode === "auth/invalid-credential") {
      setFirebaseError("Invalid email or password.")
    } else if (errorCode === "auth/user-not-found") {
      setFirebaseError("No account found with this email.")
    } else if (errorCode === "auth/wrong-password") {
      setFirebaseError("Incorrect password.")
    } else if (errorCode === "auth/user-disabled") {
      setFirebaseError("This account has been disabled.")
    } else if (errorCode === "auth/too-many-requests") {
      setFirebaseError("Too many failed attempts. Please try again later.")
    } else if (errorCode === "auth/network-request-failed") {
      setFirebaseError("Network error. Please check your connection.")
    } else if (errorCode === "auth/invalid-email") {
      setFirebaseError("Invalid email format.")
    } else {
      setFirebaseError("An unexpected error occurred. Please try again.")
      console.error("Login error:", error)
    }
  }
}
```

**Add UI for loading, errors, and success:**

Add error and success message displays before the form inputs:
```typescript
{firebaseError && (
  <div className={styles.firebaseError} role="alert">
    {firebaseError}
  </div>
)}

{successMessage && (
  <div className={styles.successMessage} role="status">
    {successMessage}
  </div>
)}
```

Disable inputs during loading:
```typescript
<input
  disabled={isLoading}
  // ... other props
/>
```

Update button with loading state:
```typescript
<button type="submit" disabled={isLoading}>
  {isLoading ? "Logging in..." : "Login"}
</button>
```

### 2. Update LoginForm Styles

**File: `components/LoginForm/LoginForm.module.css`** (modify)

Add the same error and success message styles as SignupForm:
```css
.firebaseError {
  @apply text-red-600 text-sm mb-4 p-3 bg-red-50 rounded;
}

.successMessage {
  @apply text-green-600 text-sm mb-4 p-3 bg-green-50 rounded;
}
```

### 3. Update LoginForm Tests

**File: `tests/components/LoginForm.test.tsx`** (modify)

**Add mocks at top of file** (same pattern as SignupForm):
```typescript
const mockSignIn = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: () => mockSignIn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
}))
```

**Update the console.log test** to test Firebase integration instead:
Replace the test "logs to console with valid form data" with:
```typescript
it("calls signInWithEmailAndPassword with valid credentials", async () => {
  const user = userEvent.setup()
  mockSignIn.mockResolvedValue({ user: { uid: "123" } })

  render(<LoginForm />)

  await user.type(screen.getByLabelText(/email/i), "test@example.com")
  await user.type(screen.getByLabelText("Password"), "password123")
  await user.click(screen.getByRole("button", { name: /login/i }))

  expect(mockSignIn).toHaveBeenCalled()

  await waitFor(() => {
    expect(screen.getByText("Login successful!")).toBeInTheDocument()
  })
})
```

**Add new test cases:**
- Test invalid credentials error
- Test network error
- Test loading state
- Test form disabled during login

## Critical Files to Modify

**Modified files:**
- `components/LoginForm/LoginForm.tsx` - Add Firebase auth integration with signInWithEmailAndPassword
- `components/LoginForm/LoginForm.module.css` - Add error/success message styles
- `tests/components/LoginForm.test.tsx` - Update mocks and add Firebase integration tests

## Existing Patterns to Reuse

- **SignupForm pattern**: Nearly identical implementation, just swap `createUserWithEmailAndPassword` for `signInWithEmailAndPassword`
- **Firebase singletons**: Import `auth` from `@/lib/firebase` (already initialized)
- **State management**: Same `isLoading`, `firebaseError`, `successMessage` pattern as SignupForm
- **Error mapping**: Similar approach but with login-specific error codes
- **Loading state**: Same disabled inputs and button text change pattern
- **Auto state update**: `AuthContext` listens to `onAuthStateChanged` - no manual updates needed
- **Testing**: Follow SignupForm test mocking pattern

## Key Differences from SignupForm

| Aspect | SignupForm | LoginForm |
|--------|-----------|-----------|
| Firebase method | `createUserWithEmailAndPassword` | `signInWithEmailAndPassword` |
| Error codes | email-already-in-use, weak-password | invalid-credential, wrong-password, user-not-found |
| Success flow | Generate codename, update profile, create Firestore doc | Just sign in (simpler) |
| Button loading text | "Creating account..." | "Logging in..." |
| Button default text | "Sign Up" | "Login" |
| Redirect | To /heists after 500ms | No redirect (per spec) |

## Implementation Sequence

1. Update `components/LoginForm/LoginForm.tsx`:
   - Add imports
   - Add state variables
   - Replace handleSubmit with async Firebase logic
   - Add UI for loading/errors/success
2. Update `components/LoginForm/LoginForm.module.css` with error/success styles
3. Update `tests/components/LoginForm.test.tsx` with mocks and new tests
4. Run tests: `npm test -- tests/components/LoginForm`
5. Manual testing in browser

## Verification Steps

After implementation:

1. **Run tests**: `npm test -- tests/components/LoginForm` - all tests should pass
2. **Type checking**: `npx tsc --noEmit` - no TypeScript errors
3. **Manual testing**:
   - Navigate to `/login` page
   - Enter valid credentials (create account via signup first if needed)
   - Click "Login" button
   - Verify loading state appears ("Logging in..." text)
   - Verify success message displays
   - Verify `useUser` hook reflects the logged-in user
   - Try invalid credentials - verify error message
   - Try network error (disable network) - verify error message
4. **No redirect**: Verify user stays on login page after success (per spec)
5. **Dev server**: No console errors during login flow

The login functionality will be complete and will work seamlessly with the existing auth infrastructure (AuthContext, useUser hook, and auth guards).
