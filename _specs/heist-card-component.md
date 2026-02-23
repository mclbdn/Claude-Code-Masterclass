# Spec for Heist Card Component

branch: claude/feature/heist-card-component

## Summary

Create a reusable HeistCard component to display heist information in a visually appealing card format. The card will replace the current plain list items on the heists page and provide a better user experience by showing key heist details at a glance.

## Functional Requirements

- Display heist title prominently
- Show heist description (truncated if too long, with ellipsis)
- Display the assigned user's codename
- Show the deadline date in a human-readable format
- Indicate final status (success/failure) if the heist is completed
- Style the card to match the current design system (dark theme with purple/pink accents)
- Make the card clickable/interactive (potential future navigation to heist details)
- Support responsive layout that works within the grid-layout system
- Use CSS Modules for styling (not inline Tailwind classes)

## Possible Edge Cases

- Very long heist titles (should wrap or truncate gracefully)
- Very long descriptions (should truncate with ellipsis after a certain length)
- Missing or null finalStatus for active/ongoing heists (should handle gracefully)
- Deadline dates that are past due (could show visual indication)
- Missing assigned user codename

## Acceptance Criteria

- HeistCard component is created in `/components/HeistCard/`
- Component accepts a `heist` prop of type `Heist` from the types
- Card displays title, description, assignedToCodename, and deadline
- Description is truncated at a reasonable length (e.g., 150 characters) with ellipsis
- Deadline is formatted in a user-friendly way (e.g., "Feb 23, 2026" or relative time)
- Final status badge is shown only when heist is completed
- Component uses CSS Modules for all styling (no inline Tailwind)
- Card styling matches the dark theme with appropriate colors from globals.css
- Component is integrated into the heists page, replacing the current `<li>` elements
- All three sections (active, assigned, expired) use the HeistCard component
- The grid-layout class is applied to properly display cards in a responsive grid

## Open Questions

- Should the card be clickable and navigate to a detail page? (Assume yes for future extensibility, but no implementation yet) no, not yet
- Should we show time remaining for active heists vs absolute deadline? yes, that's a good idea
- What visual distinction should expired heists have compared to active ones? they can be gray.

## Testing Guidelines

Create a test file in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders heist title correctly
- Renders and truncates long descriptions
- Displays assigned user codename
- Formats deadline date correctly
- Shows final status badge when heist is completed
- Does not show final status badge when heist is active
- Handles missing or null values gracefully
- Applies correct CSS classes from the module
