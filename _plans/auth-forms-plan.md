# Implementation Plan: Authentication Forms

## Context

The /login and /signup pages currently exist as bare-bones placeholders with only heading elements. We need to implement fully functional authentication forms with email/password inputs, password visibility toggles, form validation, and console logging. Users should be able to easily navigate between the two forms. This is a foundational feature for the authentication flow, though it won't connect to a real backend yet.

## Architecture

Create two separate form components (LoginForm and SignupForm) rather than a shared component. This provides clarity, easier testing, and room for future divergence (e.g., password confirmation on signup).

**Component Structure:**
```
/components
  /LoginForm
    LoginForm.tsx
    LoginForm.module.css
    index.ts
  /SignupForm
    SignupForm.tsx
    SignupForm.module.css
    index.ts
```

## Critical Files

- `/components/LoginForm/LoginForm.tsx` - Login form with email/password inputs, validation, password toggle
- `/components/LoginForm/LoginForm.module.css` - Form styling using CSS Modules with @apply
- `/components/SignupForm/SignupForm.tsx` - Signup form (similar structure to LoginForm)
- `/components/SignupForm/SignupForm.module.css` - Form styling
- `/app/(public)/login/page.tsx` - Fix export name bug, integrate LoginForm
- `/app/(public)/signup/page.tsx` - Integrate SignupForm
- `/tests/components/LoginForm.test.tsx` - Comprehensive test suite
- `/tests/components/SignupForm.test.tsx` - Comprehensive test suite

## Implementation Details

### LoginForm Component

**State Management:**
- `email` (string) - controlled input
- `password` (string) - controlled input
- `showPassword` (boolean) - toggles password visibility
- `errors` (object) - validation error messages

**Password Toggle:**
- Use `Eye` and `EyeOff` icons from `lucide-react`
- Button positioned absolute within password input wrapper
- Changes input type between "password" and "text"
- Use `type="button"` to prevent form submission
- Aria-label updates based on state: "Show password" / "Hide password"

**Validation:**
- Email: required + regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: required + minimum 6 characters
- Trigger validation on form submit
- Display error messages below each field with red text
- Set `aria-invalid` and `aria-describedby` on invalid inputs

**Form Submission:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // Run validation
  // If valid: console.log("Login attempt:", { email, password })
  // Show success alert
}
```

**Navigation:**
- Link to /signup at bottom: "Don't have an account? Sign up"
- Use Next.js Link component

**CSS Patterns:**
- Start file with `@reference "../../app/globals.css"`
- Use `@apply` to combine Tailwind utilities (max 1 inline class)
- Classes: .form, .inputGroup, .label, .input, .inputError, .passwordWrapper, .toggleButton, .error, .submitButton, .switchForm, .link

**Accessibility:**
- All inputs have `aria-label`
- Error messages have `role="alert"`
- Use `aria-invalid` and `aria-describedby` for validation
- Toggle button has descriptive aria-label

### SignupForm Component

Nearly identical to LoginForm with these differences:
- Submit button text: "Sign Up"
- Console log: "Signup attempt:"
- Navigation link: "Already have an account? Log in" → /login

### Page Integration

**app/(public)/login/page.tsx:**
- Fix bug: export name is "SignupPage" but should be "LoginPage"
- Import and render LoginForm within existing layout structure (.center-content, .page-content, .form-title)

**app/(public)/signup/page.tsx:**
- Import and render SignupForm within existing layout structure

### Testing Strategy

**For each form component, test:**

1. **Rendering:** All form elements present (email input, password input, submit button, navigation link)
2. **Password Toggle:** Starts hidden, clicking toggle changes type and icon, aria-label updates
3. **Empty Field Validation:** Shows "Email is required" and "Password is required"
4. **Invalid Email:** Shows "Please enter a valid email address"
5. **Short Password:** Shows error for passwords under 6 characters
6. **Successful Submission:** Calls console.log with correct data
7. **Accessibility:** Proper aria attributes, error announcements

Use `@testing-library/user-event` for interactions, `vi.spyOn` for console.log assertions.

## Step-by-Step Implementation Order

1. **Create LoginForm Component**
   - Create directory and files (LoginForm.tsx, LoginForm.module.css, index.ts)
   - Implement state management, form structure, password toggle UI
   - Add validation logic and form submission handler
   - Add navigation link to signup
   - Style with CSS Module

2. **Update Login Page**
   - Fix export name bug in `/app/(public)/login/page.tsx`
   - Import and integrate LoginForm component

3. **Create SignupForm Component**
   - Duplicate LoginForm structure
   - Modify text/labels for signup context
   - Update navigation link to /login

4. **Update Signup Page**
   - Import and integrate SignupForm into `/app/(public)/signup/page.tsx`

5. **Write LoginForm Tests**
   - Create `/tests/components/LoginForm.test.tsx`
   - Implement all 7 test scenarios
   - Run: `npm test -- LoginForm.test.tsx`

6. **Write SignupForm Tests**
   - Create `/tests/components/SignupForm.test.tsx`
   - Adapt LoginForm tests for signup context
   - Run: `npm test -- SignupForm.test.tsx`

7. **Manual QA**
   - Test navigation flow between /login and /signup
   - Test validation with various inputs
   - Test keyboard navigation (Tab, Enter)
   - Verify console logging works
   - Test password toggle interaction

## Key Patterns to Follow

- **No semicolons** in TypeScript code
- **Props typing:** `Readonly<ComponentNameProps>`
- **CSS Modules:** Each component has its own .module.css file starting with `@reference "../../app/globals.css"`
- **Max 1 Tailwind class inline** - combine multiple with `@apply` in CSS Module
- **Imports:** Use `@/` alias (e.g., `@/components/LoginForm`)
- **Icons:** Import from `lucide-react`
- **Tests:** Use `describe`, `it`, `expect` from vitest; semantic queries from React Testing Library

## Verification

After implementation, verify:
1. Navigate to http://localhost:3000/login - form renders correctly
2. Try submitting empty form - validation errors appear
3. Enter invalid email - shows email format error
4. Enter valid credentials - logs to console and shows success message
5. Click "Sign up" link - navigates to /signup page
6. Repeat validation tests on signup form
7. Click password toggle - password text becomes visible/hidden
8. Run `npm test` - all tests pass
9. Check accessibility: Tab through form, Enter to submit works
