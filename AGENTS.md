# AGENTS.md — Cube Coach

React 19 + TypeScript + Vite 6 Rubik's Cube (OLL/PLL/F2L) trainer. Ships as web (Netlify/PWA), iOS (Capacitor), and desktop (Electron).

## Commands

- `npm run dev` — Vite dev server on port 3000, bound to `0.0.0.0`.
- `npm run build` — `vite build` to `dist/`.
- `npm run lint` — runs `tsc --noEmit`. This is the **only** lint/typecheck step. There is **no eslint or prettier**; style is enforced by TS `strict` mode. Don't add or expect an eslint config to run.
- `npm test` — runs **only** `test-normalize.js` (one plain-node script, no test framework).
- `npm run test:integration` — runs `test-url-generation.cjs` and `test-simple-formats.cjs`; these **download SVGs over the network**, so they need internet and are not part of `npm test`.
- `npm run generate-scrambles` — regenerates and **overwrites** `src/data/ollCases.ts` and `src/data/pllCases.ts` (via `cubejs`). Destructive to committed data files; run deliberately.
- `npm run cli` — `python3 scripts/cli.py` (uses root `scrambles.json`).
- `npm run electron:dev` / `electron:build` (mac), `npm run ios:dev` (needs Xcode).

## Build / deploy quirks

- Vite `base` is `./` by default (relative paths, for Netlify/local). The GitHub Pages deploy sets `GITHUB_PAGES=true` to use base `/cube-coach/`. CI (`.github/workflows/deploy.yml`) builds with that env on push to `main` and publishes `dist/` to Pages.
- Tailwind 4 is wired via the `@tailwindcss/vite` plugin — there is **no `tailwind.config` or PostCSS config**. Theme tokens live in `src/index.css` and `src/themes.ts`.
- PWA via `vite-plugin-pwa`, `registerType: 'prompt'` (users manually accept updates). Manifest is generated at build time.
- `vite.config.ts` splits `src/data/` into a separate `cube-data` chunk (large case library) so it caches independently.

## Architecture

- `src/App.tsx` is the single main component/router; `src/main.tsx` is the entry. `src/components/` holds UI; `src/lib/` (audio, stats) and `src/utils/` (moveCount) are the only non-data modules.
- `src/data/` is the heart of the app: OLL/PLL/F2L cases and algorithms. `originalSetups.ts` (~248KB) is the reference source for scramble generation — don't hand-edit it; regenerate via the script above.
- Path alias `@/*` maps to the **repo root** `./*` (not `src`), configured in both `vite.config.ts` and `tsconfig.json`, but the codebase currently uses relative imports.
- `electron.cjs` is the Electron main; `capacitor.config.ts` points `webDir` at `dist/`.

## Cleanup

- `npm run clean` removes `dist/`, `release/`, and `server.js`. These are build artifacts (all gitignored).
