# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pocket Heist is a Next.js 16 application built with React 19.2, TypeScript, and Tailwind CSS v4. The app uses Next.js App Router with route groups to separate authenticated and unauthenticated sections.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for a specific file
npm test -- path/to/test/file.test.tsx
```

## Architecture

### Route Structure

The app uses Next.js App Router with route groups for layout separation:

- **`app/(public)/`**: Unauthenticated routes with minimal layout
  - Landing page (`page.tsx`)
  - `/login`, `/signup`, `/preview`
  - Public layout applies basic styling without navigation

- **`app/(dashboard)/`**: Authenticated routes with full navigation
  - `/heists` - heist listing
  - `/heists/create` - create new heist
  - `/heists/[id]` - heist details (dynamic route)
  - Dashboard layout includes Navbar component

- **`app/layout.tsx`**: Root layout with global metadata and styles

### Component Organization

Components are organized in the `/components` directory with the following pattern:
- Each component gets its own directory
- Structure: `ComponentName/ComponentName.tsx`, `ComponentName.module.css`, `index.ts`
- Components export from index.ts for cleaner imports
- Use `@/` path alias for imports (e.g., `import Navbar from "@/components/Navbar"`)

### Testing

- **Framework**: Vitest with React Testing Library
- **Environment**: happy-dom (configured in vitest.config.mts)
- **Location**: Tests live in `/tests` directory, mirroring the component structure
- **Setup**: `vitest.setup.ts` imports jest-dom matchers
- **Config**: `vitest.config.mts` configures happy-dom environment with globals enabled
- **Pattern**: Use `describe` blocks, test with `render` from @testing-library/react
- Test files use `.test.tsx` extension

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Vitest globals enabled in types
- Strict mode enabled
- JSX transform: `react-jsx`

## Feature Development Workflow

### Custom Skills

This project uses three custom Claude Code skills for structured development:

1. **`/spec [feature description]`** - Creates a feature specification
   - Checks for uncommitted changes (aborts if found)
   - Creates a new branch: `claude/feature/<feature-name>`
   - Generates a spec file in `_specs/` directory following the template
   - Use this to start any new feature work

2. **`/component [component description]`** - Creates components using TDD
   - Writes tests first in `tests/components/`
   - Creates component structure in `components/`
   - Runs tests to verify implementation
   - Adds component to `/preview` page for visual review
   - Follow the TDD cycle: test → fail → implement → pass

3. **`/commit-message`** - Generates structured commit messages
   - Analyzes git diffs and recent commit history
   - Creates descriptive commit messages following project style
   - Adds co-authorship attribution

### Spec and Plan Directories

- **`_specs/`**: Feature specifications following a standardized template
  - Each spec includes: summary, functional requirements, edge cases, acceptance criteria, testing guidelines
  - Reference `_specs/template.md` for the structure
  - Specs guide implementation and provide clear acceptance criteria

- **`_plans/`**: Implementation plans created during Plan Mode
  - Detailed technical plans for implementing specs
  - Created after spec approval, before implementation begins

## Code Style

- Component files use TypeScript with strict typing
- **NO semicolons** for JavaScript or TypeScript code
- CSS Modules for component-specific styles (use `.module.css` files)
- Global styles in `app/globals.css`
- Import components using the `@/` alias
- Use `Readonly<{ children: React.ReactNode }>` for layout props

### Tailwind CSS Usage

- Do NOT apply Tailwind classes directly in component templates unless essential or just 1 class at most
- If an element needs more than a single Tailwind class, combine them into a custom CSS class using the `@apply` directive in the CSS Module file
- This keeps components clean and styles maintainable

## Git Workflow

- Use `git switch -c <branch>` to create and switch to new branches (not `git checkout`)
- Feature branches follow the pattern: `claude/feature/<feature-name>`
- Main branch for PRs: `main`
- Development branch: `develop`
- Use minimal project dependencies where possible

## Additional Notes

- Preview page (`/preview`) is used to showcase components during development
- ESLint config uses Next.js recommended rules with TypeScript support
- The project ignores `.next/`, `out/`, `build/`, and `next-env.d.ts` in linting
