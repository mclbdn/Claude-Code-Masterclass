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
npm build

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
- **Location**: Tests live in `/tests` directory, mirroring the component structure
- **Setup**: `vitest.setup.ts` imports jest-dom matchers
- **Config**: `vitest.config.mts` configures jsdom environment with globals enabled
- **Pattern**: Use `describe` blocks, test with `render` from @testing-library/react
- Test files use `.test.tsx` extension

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Vitest globals enabled in types
- Strict mode enabled
- JSX transform: `react-jsx`

## Code Style

- Component files use TypeScript with strict typing
- CSS Modules for component-specific styles
- Global styles in `app/globals.css`
- Import components using the `@/` alias
- Use Readonly<{ children: React.ReactNode }> for layout props

## Additional Coding Preferences
- Do NOT use semicolons for JavaScript or TypeScript code.
- Do NOT apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than a single tailwind class, combine them into a custom class using the
'Capply' directive.
- Use minimal project dependencies where possible.
- Use the 'git switch -c' command to switch to new branches, not 'git checkout'.