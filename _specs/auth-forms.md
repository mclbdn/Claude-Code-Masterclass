# Spec for Authentication Forms

branch: claude/feature/auth-forms

## Summary

Create login and signup forms for the /login and /signup pages. Both forms will include email and password fields, a password visibility toggle, and a submit button. Form submissions will log credentials to the console for now. Users should be able to easily navigate between the two forms.

## Functional Requirements

- Email input field with appropriate type and validation
- Password input field with hide/show toggle icon
- Submit button with context-appropriate label ("Login" or "Sign Up")
- Form submission prevents default behavior and logs form data to console
- Easy navigation/switching between /login and /signup pages
- Client-side form validation for email format and password requirements
- Accessible form elements with proper labels and ARIA attributes
- Visual feedback for form validation errors
- Password visibility toggle updates icon state appropriately

## Possible Edge Cases

- Empty form submission attempts
- Invalid email format entries
- Password visibility toggle state when switching between forms
- Form state management after submission
- Rapid toggling of password visibility
- Navigation between forms with partially filled data
- Browser autofill compatibility
- Keyboard navigation and form submission

## Acceptance Criteria

- Both /login and /signup pages render with email and password fields
- Password field includes a clickable icon to toggle visibility
- Password text switches between hidden (dots/asterisks) and visible text
- Submit button displays "Login" on /login page and "Sign Up" on /signup page
- Form submission logs email and password to browser console
- Navigation link or button allows users to switch between login and signup
- Form validation displays error messages for invalid inputs
- All form elements are keyboard accessible
- Form prevents submission when validation fails
- Password toggle icon visually indicates current state (eye/eye-slash)

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Form component renders with all required fields (email, password, submit button)
- Password visibility toggle changes input type between "password" and "text"
- Password toggle icon updates when clicked
- Form submission handler is called with correct email and password data
- Console.log is called with form data on submission
- Form validation prevents submission with invalid email
- Form validation prevents submission with empty fields
- Submit button displays correct label based on form context
- Navigation between login and signup forms works correctly
