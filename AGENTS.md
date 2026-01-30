# Repository Guidelines

## Project Structure & Module Organization
- `RealGuitarHero/app/` holds the Expo Router screens and layouts. `_layout.tsx` is the root stack; `app/(tabs)/` contains tab routes like `index.tsx`, `game.tsx`, and `library.tsx`.
- `RealGuitarHero/assets/` stores app icons, splash art, and web favicon.
- `docs/` contains product/design documentation.
- Core config lives in `RealGuitarHero/app.json`, `RealGuitarHero/tsconfig.json`, and `RealGuitarHero/package.json`.

## Build, Test, and Development Commands
Run commands from `RealGuitarHero/`.
- `npm install` installs dependencies.
- `npm run start` launches the Expo dev server.
- `npm run android` / `npm run ios` / `npm run web` start the app on each platform.
There is no build script yet; use Expo’s build tooling if one is added later.

## Coding Style & Naming Conventions
- TypeScript + React Native with Expo Router.
- Use 2-space indentation, single quotes, and semicolons (match existing `app/` files).
- Route files are lower-case; route groups use parentheses (e.g., `app/(tabs)/`).
- Components use PascalCase; hooks and Zustand stores should follow `useX` / `useXStore`.

## Testing Guidelines
- Testing deps (Jest + React Native Testing Library) are present, but no test script/config is defined yet.
- When adding tests, name them `*.test.tsx` and colocate with the component or place under `__tests__/`.
- Add an `npm test` script once Jest config is introduced.

## Commit & Pull Request Guidelines
- Recent commits mix short summaries with Conventional Commits (e.g., `feat:`). Prefer `type: summary` when possible; otherwise keep a concise, imperative summary.
- PRs should include a clear description, linked issue (if any), and screenshots or screen recordings for UI changes.
