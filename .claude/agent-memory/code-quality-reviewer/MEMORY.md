# Code Quality Reviewer Memory

## Project Conventions

### Code Style
- **No semicolons** in TypeScript/JavaScript files (enforced project style)
- Use `Readonly<Props>` for component props
- Import using `@/` path alias

### Component Structure
- Components in `/components/ComponentName/` directory
- Pattern: ComponentName.tsx, ComponentName.module.css, index.ts
- Export from index.ts for cleaner imports

### CSS Modules
- Use `@apply` directive to combine Tailwind classes
- Avoid applying multiple Tailwind classes directly in templates
- CSS variables for colors: `--color-primary`, `--color-body`, `--color-heading`, `--color-success`, `--color-error`, `--color-lighter`

### Testing
- Vitest + React Testing Library
- Tests mirror component structure in `/tests` directory
- Mock dependencies with `vi.mock()`
- Use `beforeEach` for setup, `afterEach` for cleanup
- Test files use `.test.tsx` or `.test.ts` extension

### Type Safety
- Firestore types in `/types/firestore/`
- Use strict TypeScript types throughout
