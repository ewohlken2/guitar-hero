# Repository Guidelines

## Project Structure & Module Organization

- `docs/plans` holds design files, specs, implementation plans, and task lists
- `GuitarSlam/app/` holds the Expo Router screens and layouts. `_layout.tsx` is the root stack; `app/(tabs)/` contains tab routes like `index.tsx`, `game.tsx`, and `library.tsx`.
- `GuitarSlam/assets/` stores app icons, splash art, and web favicon.
- `docs/` contains product/design documentation.
- Core config lives in `GuitarSlam/app.json`, `GuitarSlam/tsconfig.json`, and `GuitarSlam/package.json`.

## Build, Test, and Development Commands

Run commands from `GuitarSlam/`.

- Prefer `pnpm` for installs and scripts (keep `package-lock.json` in sync if you must use npm).
- `pnpm install` installs dependencies.
- `pnpm start` launches the Expo dev server.
- `pnpm android` / `pnpm ios` / `pnpm web` start the app on each platform.
  There is no build script yet; use Expo’s build tooling if one is added later.

## Coding Style & Naming Conventions

- TypeScript + React Native with Expo Router.
- Use 2-space indentation, single quotes, and semicolons (match existing `app/` files).
- Route files are lower-case; route groups use parentheses (e.g., `app/(tabs)/`).
- Components use PascalCase; hooks and Zustand stores should follow `useX` / `useXStore`.

## Testing Guidelines

- Jest is configured via `GuitarSlam/jest.config.js` (jest-expo). Run tests with `pnpm test`.
- Name tests `*.test.tsx` and colocate with the component or place under `__tests__/`.

## Commit & Pull Request Guidelines

- Recent commits mix short summaries with Conventional Commits (e.g., `feat:`). Prefer `type: summary` when possible; otherwise keep a concise, imperative summary.
- PRs should include a clear description, linked issue (if any), and screenshots or screen recordings for UI changes.
