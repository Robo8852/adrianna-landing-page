# tooling

> **What this covers:** How to run, lint, test, build, and ship the showcase app — the build/dev/test/CI/deploy infrastructure.

## What
- **Stack:** Next.js 16 (`next@16.2.6`, Turbopack is the default bundler), React 19.2 (`react`/`react-dom@19.2.6`), TypeScript 5.6 (`strict`, `noEmit`), Tailwind CSS 3 (`tailwindcss@3.4.14`) via PostCSS + autoprefixer.
- This domain governs the **app lifecycle**: dev server, production build, linting (ESLint 9 flat config + `eslint-config-next`), unit/component testing (Vitest 2 + jsdom + Testing Library), the GitHub Actions CI gate, and Vercel deploys.
- The app lives in `showcase/`. **All npm commands run from `showcase/`** (CI sets `working-directory: showcase`).
- Node is pinned to `>=20.9.0` via `engines`; package is `private`, name `altar-within-showcase`.

## Where
- `showcase/package.json` — scripts (`dev`/`build`/`start`/`lint`/`test`/`test:watch`), deps, `engines.node >=20.9.0`, `private: true`, and `overrides` pinning `@types/react`/`@types/react-dom`.
- `showcase/package-lock.json` — exact dependency lockfile; **must stay in sync** because CI installs via `npm ci` (see caveat).
- `showcase/next.config.mjs` — Next config; only sets `reactStrictMode: true`.
- `showcase/tsconfig.json` — TS compiler config: `strict`, `noEmit`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, path alias `@/* -> ./*`, includes `.next/types`.
- `showcase/eslint.config.mjs` — ESLint **flat** config: global ignores → spread `eslint-config-next` → one override block downgrading `react-hooks/set-state-in-effect` to `warn`.
- `showcase/vitest.config.mts` — Vitest config (`.mts` on purpose, see below): jsdom env, globals on, `setupFiles`, `@` alias, include `**/*.{test,spec}.{ts,tsx}`.
- `showcase/vitest.setup.ts` — global test setup: imports jest-dom matchers, stubs `matchMedia` + `IntersectionObserver`, auto-`cleanup()` after each test.
- `showcase/postcss.config.mjs` — PostCSS pipeline: `tailwindcss` + `autoprefixer` plugins (drives Tailwind 3).
- `.github/workflows/ci.yml` — GitHub Actions: on PR/push to `main`, run **lint → test → build** in `showcase/` on Node 20.

## How

### Commands (run from `showcase/`)
- `npm install` — install deps locally (use `npm ci` to mirror CI exactly from the lockfile).
- `npm run dev` — start the dev server (`next dev`, Turbopack, http://localhost:3000) with HMR; `reactStrictMode` double-invokes effects in dev.
- `npm run build` — production build (`next build`).
- `npm start` — serve the production build (`next start`); requires a prior `npm run build`.
- `npm run lint` — `eslint .` over the project (flat config).
- `npm test` — `vitest run` (single CI-style pass, non-watch). This is what CI runs.
- `npm run test:watch` — `vitest` in interactive watch mode for local TDD.

> Note: scripts use plain `next dev`/`next build` (no explicit `--turbopack` flag). Next 16 uses Turbopack as the default bundler, so dev/build are Turbopack-driven without extra flags.

### CI pipeline (`.github/workflows/ci.yml`)
- **Triggers:** `pull_request` → `main` and `push` → `main`.
- **Concurrency:** `group: ci-${{ github.ref }}` with `cancel-in-progress: true` — superseded runs on the same ref are cancelled to save minutes.
- **Single job `verify`** (`ubuntu-latest`, `working-directory: showcase`):
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` — Node 20, `cache: npm`, `cache-dependency-path: showcase/package-lock.json`.
  3. `npm ci` — clean install from the lockfile.
  4. `npm run lint`
  5. `npm test`
  6. `npm run build`
- Order matters: lint and test fail fast before the (slower) build. A red build/test/lint blocks the PR.

### Deploy model (Vercel)
- **`main` → production:** every push/merge to `main` triggers a Vercel production deploy.
- **PR → preview:** every pull request gets a Vercel preview deployment (unique URL) for review.
- Vercel and the GitHub Actions CI run **independently** — CI is the merge gate; Vercel publishes the result. Keep `engines.node >=20.9.0` aligned with the Vercel project's Node version.

### Node engines pin
- `engines.node: ">=20.9.0"` in `package.json`. CI uses Node 20; set local nvm/Volta and the Vercel project to a `>=20.9` runtime. Builds on older Node are unsupported.

### ESLint flat config + the downgraded rule
- `eslint.config.mjs` is the **flat** config format (ESLint 9). It spreads `eslint-config-next` (Next's recommended + core-web-vitals rules) and adds one override.
- Global ignores (`.next/**`, `node_modules/**`, `**/*.bak.tsx`) must live in their **own object containing only `ignores`** — that's a flat-config requirement, not a stylistic choice.
- **`react-hooks/set-state-in-effect` is set to `"warn"` (not `"error"`) on purpose.** react-hooks v7 flags *any* synchronous `setState` inside an effect. This codebase relies on two legitimate, idiomatic patterns that trip it: (1) the SSR **"mounted" hydration guard** (`setMounted(true)` in an effect to avoid hydration mismatches), and (2) a **prefers-reduced-motion early-return** that sets state. Downgrading to `warn` keeps the signal visible without letting accepted code turn `npm run lint` — and therefore CI — red.

### Vitest `.mts` + jsdom stubs
- The config file is `vitest.config.mts` (**`.mts`, not `.ts`/`.mjs`**) because it imports `@vitejs/plugin-react`, which is **ESM-only**. The `.mts` extension forces Node/Vitest to load the config as an ES module so that import resolves.
- `vitest.config.mts`: `environment: "jsdom"`, `globals: true` (no need to import `describe/it/expect`), `setupFiles: ["./vitest.setup.ts"]`, test glob `**/*.{test,spec}.{ts,tsx}`, excludes `node_modules`/`.next`, and an `@ -> .` resolve alias mirroring tsconfig so app imports work in tests.
- `vitest.setup.ts` runs before every test file and:
  - imports `@testing-library/jest-dom/vitest` (adds matchers like `toBeInTheDocument`),
  - **stubs `window.matchMedia`** — jsdom doesn't implement it, and hooks (e.g. `useReveal`) read it for `prefers-reduced-motion`; the stub returns `matches: false` with no-op listeners so components render,
  - **stubs `IntersectionObserver`** — jsdom lacks it; `useReveal` uses it to trigger reveals. A mock class with no-op `observe/unobserve/disconnect/takeRecords` is assigned to `window`/`globalThis`,
  - registers `afterEach(cleanup)` to unmount React trees between tests.

### Adding a test
1. Create a file matching `**/*.{test,spec}.{ts,tsx}` (co-locate next to the component, e.g. `components/Foo.test.tsx`).
2. Use globals (`describe`, `it`, `expect`) — no imports needed (`globals: true`).
3. Use Testing Library: `import { render, screen } from "@testing-library/react"`. jest-dom matchers and the matchMedia/IntersectionObserver stubs are already in place via setup.
4. Import app modules via the `@/...` alias.
5. Run `npm run test:watch` while developing; `npm test` for the final single pass.

### Gotchas / caveats
- **`npm ci` lock-sync:** CI runs `npm ci`, which **fails hard if `package-lock.json` is out of sync with `package.json`** (a stale lock has broken CI before). After any dependency change, run `npm install` and **commit the updated `package-lock.json`** in the same PR.
- **`overrides`:** `package.json` pins `@types/react@19.2.15` / `@types/react-dom@19.2.3` via `overrides` to keep React 19 types consistent across the tree — don't bump these without updating the override.
- **Build excludes `*.bak.tsx`:** ESLint ignores `**/*.bak.tsx`; don't rely on backup files being linted/checked.
- **Run from `showcase/`:** commands run anywhere else won't find the right `package.json`; CI pins `working-directory: showcase` for this reason.
- **Strict mode double-invoke:** `reactStrictMode: true` re-runs effects in dev — expected, not a bug. Effect-based logic (mounted guard, observers) must be idempotent.
