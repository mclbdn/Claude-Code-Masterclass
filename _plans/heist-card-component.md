# Implementation Plan: HeistCard Component

## Context

The heists page (`/app/(dashboard)/heists/page.tsx`) currently displays heists as plain list items showing only the title. This provides a poor user experience with no visual appeal or useful information at a glance.

This implementation will create a reusable `HeistCard` component that displays heist information in an attractive card format, showing title, description, assigned user, deadline, time remaining, and completion status. The cards will match the existing dark theme design and replace the current list items across all three heist sections (active, assigned, expired).

User specifications:
- Show time remaining for active heists (not just absolute deadline)
- Expired heists should appear grayed out
- Cards should not be clickable yet (future enhancement)

## Implementation Approach

### 1. Date Utility Functions

**Why:** The codebase has no date formatting library. We'll use native JavaScript `Intl.DateTimeFormat` and custom utilities to avoid adding dependencies (aligned with CLAUDE.md preference for minimal dependencies).

**Create:** `/lib/utils/dateUtils.ts`

Functions needed:
- `formatDeadline(date: Date): string` - Format as "Feb 23, 2026" using Intl.DateTimeFormat
- `getTimeRemaining(deadline: Date): string | null` - Calculate and format time remaining:
  - Return null if deadline has passed
  - Format: "2d 5h" for > 24h, "3h 45m" for < 24h, "45m" for < 1h
- `isExpired(deadline: Date): boolean` - Simple check if deadline < now

**Create test file:** `/tests/lib/utils/dateUtils.test.ts`
- Test date formatting output
- Test time remaining calculations with various time ranges
- Test expiration detection
- Use `vi.setSystemTime()` to control current time in tests

### 2. HeistCard Component

**Create directory structure:**
```
/components/HeistCard/
├── HeistCard.tsx
├── HeistCard.module.css
└── index.ts
```

**Component interface:**
```typescript
interface HeistCardProps {
  heist: Heist  // from @/types/firestore/heist
}
```

**Component structure:**
- Use `<article>` element for semantic HTML
- Header: title + status badge (only if `finalStatus` is "success" or "failure")
- Body: description (use CSS `line-clamp-2` for truncation)
- Footer:
  - Assigned to codename
  - Formatted deadline
  - Time remaining (only for active heists without finalStatus)
  - "Expired" indicator (for past deadlines without finalStatus)

**Styling requirements:**
- CSS Modules only (no inline Tailwind)
- Use `@reference "../../app/globals.css"`
- Use `@apply` for Tailwind utilities
- camelCase class names
- Color scheme: use design tokens from globals.css
  - Base card: dark background (`--color-light` or `--color-lighter`)
  - Expired modifier: reduced opacity, gray text
  - Success badge: green (`--color-success`)
  - Failure badge: red (`--color-error`)
  - Text: `--color-heading` for titles, `--color-body` for secondary text

**Key CSS classes:**
- `.card` - Base card styling
- `.cardExpired` - Applied when `isExpired(deadline)` is true
- `.cardHeader`, `.title`, `.badge`, `.badgeSuccess`, `.badgeFailure`
- `.cardBody`, `.description`
- `.cardFooter`, `.assignee`, `.deadline`, `.timeRemaining`, `.expiredText`

**Conditional styling logic:**
```typescript
const expired = isExpired(heist.deadline)
const showStatusBadge = heist.finalStatus !== null
const timeRemaining = !heist.finalStatus && !expired
  ? getTimeRemaining(heist.deadline)
  : null
```

**Status badge display:**
- Show only when `heist.finalStatus` is "success" or "failure"
- Text: "Success" (green) or "Failure" (red)
- Position: Top right of card header

**Export pattern:** `/components/HeistCard/index.ts`
```typescript
export { default } from './HeistCard'
```

**Create test file:** `/tests/components/HeistCard.test.tsx`

Test cases:
- Renders all heist information correctly
- Shows status badge only when finalStatus exists
- Shows time remaining for active heists
- Shows "Expired" for past deadline without status
- Applies expired styling correctly
- Handles long descriptions (CSS truncation)
- Handles missing/null values gracefully

Mock setup:
```typescript
vi.mock('@/lib/utils/dateUtils', () => ({
  isExpired: vi.fn(),
  formatDeadline: vi.fn(),
  getTimeRemaining: vi.fn()
}))
```

### 3. Integration into Heists Page

**File:** `/app/(dashboard)/heists/page.tsx`

Changes:
1. Import HeistCard: `import HeistCard from "@/components/HeistCard"`
2. Replace each `<ul>` with `<div className="grid-layout">`
3. Replace `<li key={heist.id}>{heist.title}</li>` with `<HeistCard key={heist.id} heist={heist} />`
4. Apply to all three sections: active, assigned, expired

Before:
```typescript
<ul>
  {activeHeists.map((heist) => (
    <li key={heist.id}>{heist.title}</li>
  ))}
</ul>
```

After:
```typescript
<div className="grid-layout">
  {activeHeists.map((heist) => (
    <HeistCard key={heist.id} heist={heist} />
  ))}
</div>
```

**Note:** The `grid-layout` class already exists in globals.css with responsive grid configuration.

### 4. Preview Page Integration (Optional but Recommended)

**File:** `/app/(public)/preview/page.tsx`

Add HeistCard with sample data to visually test different states:
- Active heist with time remaining
- Expired heist (grayed out)
- Completed heist (success badge)
- Failed heist (failure badge)
- Long title/description (truncation)

## Critical Files

**New files to create:**
- `/lib/utils/dateUtils.ts` - Date formatting utilities
- `/tests/lib/utils/dateUtils.test.ts` - Date utils tests
- `/components/HeistCard/HeistCard.tsx` - Main component
- `/components/HeistCard/HeistCard.module.css` - Component styles
- `/components/HeistCard/index.ts` - Export
- `/tests/components/HeistCard.test.tsx` - Component tests

**Existing files to modify:**
- `/app/(dashboard)/heists/page.tsx` - Replace list items with cards
- `/app/(public)/preview/page.tsx` - Add card preview (optional)

**Reference files:**
- `/types/firestore/heist.ts` - Heist type definition (finalStatus is "success" | "failure" | null)
- `/app/globals.css` - Design tokens and grid-layout utility
- `/components/Avatar/Avatar.tsx` - Component pattern reference
- `/components/CreateHeistForm/CreateHeistForm.module.css` - CSS module pattern reference

## Implementation Sequence

**Step 1: Date Utilities (TDD)**
1. Write tests in `/tests/lib/utils/dateUtils.test.ts`
2. Implement functions in `/lib/utils/dateUtils.ts`
3. Run `npm test` to verify

**Step 2: HeistCard Component (TDD)**
1. Write tests in `/tests/components/HeistCard.test.tsx`
2. Create component structure files
3. Implement component in `HeistCard.tsx`
4. Create styles in `HeistCard.module.css`
5. Run `npm test` to verify

**Step 3: Integration**
1. Add to preview page for visual testing
2. Integrate into heists page
3. Test in browser with `npm run dev`

**Step 4: Manual Verification**
1. Visit `/preview` - verify card appearance in different states
2. Visit `/heists` - verify cards display correctly for all sections
3. Test responsive behavior (resize browser)
4. Verify expired vs active styling
5. Verify status badges appear correctly

## Verification

**Automated tests:**
```bash
npm test -- dateUtils.test.ts
npm test -- HeistCard.test.tsx
```

**Manual testing:**
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/preview`
   - Verify cards render with different states
   - Check responsive grid layout
   - Verify expired styling (gray appearance)
   - Verify status badges (success/failure)
3. Navigate to `http://localhost:3000/heists`
   - Verify all three sections use HeistCard
   - Verify grid layout applies
   - Verify real heist data displays correctly
4. Create test heist with near deadline to verify time remaining display
5. Check accessibility: semantic HTML, color contrast

**Success criteria:**
- All tests pass
- Cards display on heists page replacing list items
- Time remaining shows for active heists
- Expired heists appear grayed out
- Status badges show for completed/failed heists
- Description truncates at 2 lines
- Grid layout is responsive
- Matches dark theme design
