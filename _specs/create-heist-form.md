# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component: N/A

## Summary

Implement a form on the `/heists/create` page that allows authenticated users to create new heist missions. The form captures heist details (title, description, assigned user) and creates a new document in the Firestore `heists` collection using the `CreateHeistInput` interface. Upon successful creation, users are redirected to the `/heists` listing page.

## Functional Requirements

- Display a form with the following fields:
  - **Title** (text input, required): The name/title of the heist
  - **Description** (textarea, required): Detailed description of the heist mission
  - **Assign To** (select dropdown, required): User to assign the heist to, populated from the Firestore `users` collection showing codenames

- Fetch available users from the Firestore `users` collection to populate the "Assign To" dropdown
  - Display user codenames in the dropdown for selection
  - Store the selected user's ID in the `assignedTo` field

- On form submission:
  - Validate all required fields are filled
  - Get the current authenticated user's ID and codename for `createdBy` and `createdByCodename`
  - Retrieve the selected assignee's codename from the users collection for `assignedToCodename`
  - Create a `CreateHeistInput` object with:
    - Form values: `title`, `description`, `assignedTo` (user ID)
    - Current user data: `createdBy`, `createdByCodename`
    - Assignee data: `assignedToCodename`
    - Programmatic values: `createdAt` (Timestamp.now()), `deadline` (48 hours from now), `finalStatus` (null)
  - Use the existing `createHeist` utility function from `@/lib/utils/createHeist` to construct the full input
  - Write the document to the Firestore `heists` collection
  - Redirect to `/heists` on successful creation

- Display appropriate loading states during:
  - Users collection fetch
  - Form submission

- Display error messages for:
  - Form validation errors
  - Firestore operation failures
  - Network errors

## Figma Design Reference

N/A

## Possible Edge Cases

- User attempts to submit with empty required fields
  - Show validation errors inline for each field

- Users collection is empty (no users to assign to)
  - Display a message indicating no users are available
  - Disable form submission

- Current user is not authenticated
  - Should be prevented by route guards, but handle gracefully if it occurs

- Firestore write operation fails
  - Display error message to user
  - Allow retry without losing form data

- Network connectivity issues during submission
  - Show appropriate error message
  - Preserve form data for retry

- User navigates away while form is submitting
  - Consider preventing navigation or showing confirmation dialog

- Selected assignee is deleted between loading the form and submission
  - Handle Firestore write validation errors gracefully

## Acceptance Criteria

- Form renders with all required fields (title, description, assign to dropdown)
- Users dropdown is populated with codenames from the Firestore `users` collection
- Form validates required fields before submission
- Successful submission creates a new document in the `heists` collection with all required fields from `CreateHeistInput`
- `createdAt` and `deadline` are set programmatically (deadline = createdAt + 48 hours)
- User is redirected to `/heists` after successful creation
- Loading states are shown during users fetch and form submission
- Validation errors are displayed clearly for empty fields
- Firestore errors are caught and displayed to the user
- Form data is preserved during submission to allow retry on error
- The implementation uses the existing `createHeist` utility function
- Form follows the project's component organization pattern with CSS modules

## Open Questions

- Should the form allow assigning a heist to the current user (self-assignment)? don't show the current logged in user in the dropdown.
- Should there be a confirmation step before creating the heist? no
- What should happen if the users collection structure doesn't include codenames? Should we auto-generate them? sure
- Should we show a success toast/message before redirecting, or redirect immediately? redirect immediately

## Testing Guidelines

Create test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases:

- Form renders with all required fields
- Form validation prevents submission with empty fields
- Users dropdown is populated correctly from Firestore data
- Successful form submission creates heist document with correct structure
- Form submission calls Firestore with `CreateHeistInput` matching the interface
- Deadline is set to 48 hours from creation time
- User is redirected to `/heists` after successful creation
- Loading state is displayed during submission
- Error messages are shown when Firestore operations fail
- Form preserves data when submission fails
- The `createHeist` utility function is called with correct parameters
