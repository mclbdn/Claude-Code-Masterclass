# Spec for Firebase Signup Integration with Random Codenames

branch: claude/feature/firebase-signup-integration

## Summary

Integrate the existing signup form with Firebase Authentication to create real user accounts. Upon successful signup, each user receives a randomly generated codename (displayName) composed of three words in PascalCase. Additionally, create a corresponding user document in Firestore's 'users' collection to store the user's codename and ID for future app features.

## Functional Requirements

- Connect the signup form at `app/(public)/signup/page.tsx` to Firebase Auth using the Web SDK
- Use `createUserWithEmailAndPassword` from `firebase/auth` to create new user accounts
- After successful account creation, generate a random codename by selecting one word from each of three distinct word sets and combining them in PascalCase format
- Update the Firebase Auth user profile with `updateProfile` to set the displayName to the generated codename
- Create a document in Firestore's `users` collection with the structure: `{ codename: string, id: string }`
- The document ID should match the user's Firebase Auth UID
- Do NOT store email addresses in the Firestore user document
- Display appropriate success feedback after successful signup
- Handle and display Firebase Auth errors (email already in use, weak password, etc.)
- Only use Firebase Web SDK (no admin SDK or server-side operations)
- After successful signup and profile setup, the global auth state should automatically update via the existing `useUser` hook

## Possible Edge Cases

- User attempts to sign up with an email that already exists
- Password does not meet Firebase's strength requirements
- Network errors during signup process
- Firestore document creation fails after successful auth account creation
- Profile update fails after account creation
- Duplicate codenames generated (low probability but possible)
- User closes browser/navigates away during multi-step signup process
- Firebase rate limiting or quota exceeded
- Invalid email format

## Acceptance Criteria

- Signup form successfully creates a Firebase Auth user account
- User's displayName is set to a randomly generated codename in PascalCase format (e.g., "SilentMoonWarrior")
- Codename is generated from exactly three word sets
- A document exists in `users` collection with correct structure: `{ codename: string, id: string }`
- Document ID matches the Firebase Auth UID
- Email is NOT stored in the Firestore user document
- Form displays appropriate error messages for Firebase Auth errors
- Form displays success feedback after successful signup
- The existing `useUser` hook reflects the newly created user after signup
- All Firebase operations use the Web SDK only
- TypeScript types are properly defined for user data structures
- Console shows no errors during the signup flow

## Open Questions

- What three word sets should be used for codename generation? (e.g., adjectives, nouns, animals) does not matter
- How many words should each set contain? does not matter
- Should we check for duplicate codenames before saving to Firestore? no
- Should the codename be editable by users later, or is it permanent? no
- Should we redirect users after successful signup? If so, where? (likely `/heists`) yes
- Should we show a loading state during the multi-step signup process? yes

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Codename generation produces PascalCase string with three words
- Codename generator selects words from three different sets
- Firebase Auth createUserWithEmailAndPassword is called with correct parameters
- updateProfile is called with generated codename
- Firestore document is created with correct structure (codename and id only)
- Form displays error message when email is already in use
- Form displays error message when password is too weak
- Form displays success feedback after successful signup
- Loading state is shown during signup process
- Form is disabled during signup to prevent duplicate submissions
